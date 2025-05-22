const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const multer = require('multer');
const cors = require('cors');

const USERS_DIR = path.join(__dirname, 'users');
const CHATS_DIR = path.join(__dirname, 'chats');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const port = 3456;

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(USERS_DIR)) fs.mkdirSync(USERS_DIR);
if (!fs.existsSync(CHATS_DIR)) fs.mkdirSync(CHATS_DIR);

app.use(express.static('public'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());

//file transfer function
// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.post('/upload-multiple-to-room', upload.array('files', 10), (req, res) => {
  const { roomNo } = req.body;
  if (!req.files || req.files.length === 0 || !roomNo) {
    return res.status(400).json({ error: 'Files and roomNo required' });
  }

  const chatFile = path.join(__dirname, 'chats', `${roomNo}.json`);
  let history = fs.existsSync(chatFile) ? JSON.parse(fs.readFileSync(chatFile)) : [];

  const uploadedMessages = req.files.map(file => {
    const message = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      text: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      sender: 'System',
      time: new Date().toLocaleTimeString(),
      type: 'file'
    };
    history.push(message);
    io.to(roomNo).emit('chat message', message);
    return message;
  });

  fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
  res.json({ message: 'Files uploaded', files: uploadedMessages });
});


// নতুন রুম তৈরি
app.post('/create-room', (req, res) => {
  const { username, password, newRoomNo } = req.body;
  const files = fs.readdirSync(USERS_DIR);
  for (let file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(USERS_DIR, file)));
    if (data.username === username && data.password === password) {
      data.roomNos.push(newRoomNo);
      fs.writeFileSync(path.join(USERS_DIR, file), JSON.stringify(data, null, 2));
      return res.json({ message: 'Room created', rooms: data.roomNos });
    }
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/delete-room', (req, res) => {
  const { username, password, roomNo } = req.body;
  const files = fs.readdirSync(USERS_DIR);
  for (let file of files) {
    const filePath = path.join(USERS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath));
    if (data.username === username && data.password === password) {
      data.roomNos = data.roomNos.filter(r => r !== roomNo);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return res.json({ message: 'Room deleted', rooms: data.roomNos });
    }
  }
  res.status(401).json({ message: 'Invalid credentials' });
});


app.post('/signup', (req, res) => {
  const { firstName, lastName, roomNos, username, password } = req.body;

  if (!Array.isArray(roomNos) || roomNos.length === 0) {
    return res.status(400).json({ message: 'Room number required' });
  }

  const files = fs.readdirSync(USERS_DIR);
  for (let file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(USERS_DIR, file)));
    if (data.username === username) {
      return res.status(400).json({ message: 'Username already taken' });
    }
  }

  const filePath = path.join(USERS_DIR, `${firstName}_${lastName}.json`);
  const userData = { firstName, lastName, roomNos, username, password };
  fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
  res.json(userData);
});



app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const files = fs.readdirSync(USERS_DIR);

  for (let file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(USERS_DIR, file)));
    if (data.username === username && data.password === password) {
      return res.json(data);
    }
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/rooms', (req, res) => {
  const files = fs.readdirSync(USERS_DIR);
  const users = files.map(file => JSON.parse(fs.readFileSync(path.join(USERS_DIR, file))));
  res.json(users);
});

io.on('connection', socket => {
  let currentRoom = '';

  socket.on('joinRoom', ({ roomNo }) => {
    if (currentRoom) socket.leave(currentRoom);
    socket.join(roomNo);
    currentRoom = roomNo;

    const filePath = path.join(CHATS_DIR, `${roomNo}.json`);
    if (fs.existsSync(filePath)) {
      const messages = JSON.parse(fs.readFileSync(filePath));
      messages.forEach(msg => socket.emit('chat message', msg));
    }

    io.emit('online users', getOnlineUsers());
  });

  socket.on('chat message', msg => {
    const time = new Date().toLocaleTimeString();
    const message = { id: Date.now(), ...msg, time };
    io.to(currentRoom).emit('chat message', message);

    const chatFile = path.join(CHATS_DIR, `${currentRoom}.json`);
    let history = [];
    if (fs.existsSync(chatFile)) {
      history = JSON.parse(fs.readFileSync(chatFile));
    }
    history.push(message);
    fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
  });

  socket.on('delete message', id => {
    const chatFile = path.join(CHATS_DIR, `${currentRoom}.json`);
    if (fs.existsSync(chatFile)) {
      let history = JSON.parse(fs.readFileSync(chatFile));
      history = history.filter(m => m.id !== id);
      fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
      io.to(currentRoom).emit('delete message', id);
    }
  });
});

function getOnlineUsers() {
  const files = fs.readdirSync(USERS_DIR);
  return files.map(file => {
const data = JSON.parse(fs.readFileSync(path.join(USERS_DIR, file)));
return {
  firstName: data.firstName,
  lastName: data.lastName,
  roomNos: data.roomNos
};

  });
}

server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
