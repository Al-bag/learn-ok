  const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- Configuration ---
const port = process.env.PORT || 3456;

// --- IMPORTANT FOR DEPLOYMENT (e.g., on Render) ---
// Use a dedicated data directory. On Render, you would mount a persistent disk here.
const DATA_DIR = path.join(__dirname, 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const CHATS_DIR = path.join(DATA_DIR, 'chats');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// --- Create Directories if they don't exist ---
[DATA_DIR, USERS_DIR, CHATS_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// --- Middleware ---
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));


// --- File Upload (Multer) Setup ---
const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
      },
      filename: (req, file, cb) => {
          // Create a unique filename to prevent overwrites
          cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB file size limit
});

// --- State Management ---
// This will store room and user information in memory for quick access
const roomState = {}; // { roomNo: { users: { socketId: {username, firstName, ...} } } }

// --- Helper Functions ---
/**
 * Reads all user data files from the USERS_DIR.
 * @returns {Array<object>} An array of user data objects.
 */
const getAllUsers = () => {
    try {
        const files = fs.readdirSync(USERS_DIR);
        return files.map(file => {
            const data = fs.readFileSync(path.join(USERS_DIR, file), 'utf-8');
            return JSON.parse(data);
        });
    } catch (error) {
        console.error("Error reading user files:", error);
        return [];
    }
};

/**
 * Finds a user by their hashed username and password.
 * @param {string} username - Hashed username.
 * @param {string} password - Hashed password.
 * @returns {object|null} The user data object or null if not found.
 */
const findUserByCredentials = (username, password) => {
    const allUsers = getAllUsers();
    return allUsers.find(u => u.username === username && u.password === password) || null;
};


// --- API Endpoints ---

// Signup
app.post('/signup', (req, res) => {
    const { firstName, lastName, roomNos, username, password } = req.body;

    if (!username || !password || !Array.isArray(roomNos) || roomNos.length === 0) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    const allUsers = getAllUsers();
    if (allUsers.some(u => u.username === username)) {
        return res.status(409).json({ message: 'Username already taken.' });
    }

    // Use a more descriptive filename, like the username hash
    const userFilename = `${username}.json`;
    const filePath = path.join(USERS_DIR, userFilename);
    const userData = { firstName, lastName, roomNos, username, password };

    try {
        fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
        // Return only non-sensitive data
        res.status(201).json({ firstName, lastName, roomNos, username: req.body.plainUsername });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error during signup." });
    }
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = findUserByCredentials(username, password);

    if (user) {
        // Don't send the password back to the client
        const { password, ...userToReturn } = user;
        res.json(userToReturn);
    } else {
        res.status(401).json({ message: 'Invalid credentials.' });
    }
});

// File Upload Endpoint
app.post('/upload-file', upload.single('file'), (req, res) => {
    const { roomNo, username, firstName, lastName } = req.body;
    
    if (!req.file || !roomNo || !username) {
      return res.status(400).json({ error: 'File, room number, and user info required.' });
    }
  
    const chatFile = path.join(CHATS_DIR, `${roomNo}.json`);
    let history = fs.existsSync(chatFile) ? JSON.parse(fs.readFileSync(chatFile)) : [];
  
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: req.file.originalname, // The original name of the file
      fileUrl: `/uploads/${req.file.filename}`,
      username: username, // Use plain username for identification
      firstName,
      lastName,
      type: 'file',
      timestamp: new Date().toISOString()
    };
    
    history.push(message);
    fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
    
    // Broadcast the file message to the room
    io.to(roomNo).emit('chat message', message);
    
    res.status(200).json({ message: 'File uploaded successfully', file: message });
});


// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  let currentRoom = '';
  let currentUser = {};

  socket.on('joinRoom', ({ roomNo, user }) => {
    if (currentRoom) {
        socket.leave(currentRoom);
        // Clean up user from old room's state
        if (roomState[currentRoom] && roomState[currentRoom].users) {
            delete roomState[currentRoom].users[socket.id];
            io.to(currentRoom).emit('updateUserList', Object.values(roomState[currentRoom].users));
        }
    }

    socket.join(roomNo);
    currentRoom = roomNo;
    currentUser = { ...user, socketId: socket.id };

    // Initialize room state if it doesn't exist
    if (!roomState[currentRoom]) {
        roomState[currentRoom] = { users: {}, typing: {} };
    }
    roomState[currentRoom].users[socket.id] = currentUser;

    // Send chat history to the user who just joined
    const filePath = path.join(CHATS_DIR, `${roomNo}.json`);
    if (fs.existsSync(filePath)) {
      const messages = JSON.parse(fs.readFileSync(filePath));
      socket.emit('chatHistory', messages);
    }

    // Notify everyone in the room about the updated user list
    io.to(currentRoom).emit('updateUserList', Object.values(roomState[currentRoom].users));
  });

  socket.on('chat message', (msg) => {
    if (!currentRoom) return;

    const message = { 
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
        ...msg,
        timestamp: new Date().toISOString() // Add server-side timestamp
    };

    io.to(currentRoom).emit('chat message', message);

    const chatFile = path.join(CHATS_DIR, `${currentRoom}.json`);
    let history = fs.existsSync(chatFile) ? JSON.parse(fs.readFileSync(chatFile)) : [];
    history.push(message);
    fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
  });

  socket.on('delete message', (id) => {
    const chatFile = path.join(CHATS_DIR, `${currentRoom}.json`);
    if (fs.existsSync(chatFile)) {
      let history = JSON.parse(fs.readFileSync(chatFile));
      const messageToDelete = history.find(m => m.id === id);
      
      // Security check: only allow user to delete their own message
      if (messageToDelete && messageToDelete.username === currentUser.username) {
        history = history.filter(m => m.id !== id);
        fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
        io.to(currentRoom).emit('delete message', id);
      }
    }
  });

  socket.on('typing', () => {
    if (currentRoom && roomState[currentRoom]) {
        roomState[currentRoom].typing[socket.id] = currentUser.firstName || currentUser.username;
        const typingUsers = Object.values(roomState[currentRoom].typing);
        // Broadcast to everyone except the sender
        socket.to(currentRoom).emit('typing', typingUsers);
    }
  });

  socket.on('stop typing', () => {
    if (currentRoom && roomState[currentRoom] && roomState[currentRoom].typing) {
        delete roomState[currentRoom].typing[socket.id];
        const typingUsers = Object.values(roomState[currentRoom].typing);
        socket.to(currentRoom).emit('typing', typingUsers);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (currentRoom && roomState[currentRoom] && roomState[currentRoom].users) {
        delete roomState[currentRoom].users[socket.id];
        delete roomState[currentRoom].typing[socket.id]; // Also remove from typing list
        
        const typingUsers = Object.values(roomState[currentRoom].typing);
        io.to(currentRoom).emit('typing', typingUsers);

        io.to(currentRoom).emit('updateUserList', Object.values(roomState[currentRoom].users));
    }
  });
});

// Uptime 
app.get('/',(req,res) => {
  res.send('ok')
})

// --- Server Initialization ---
server.listen(port, () => console.log(`Server running on http://localhost:${port} `));
