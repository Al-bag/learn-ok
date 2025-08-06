
/**
 * =================================================================
 * Main JavaScript for Bootstrap Chat App
 * =================================================================
 * This script handles user authentication, room management,
 * real-time messaging via Socket.IO, and UI interactions
 * for the Bootstrap-styled chat interface.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    const roomNameSpan = document.getElementById('roomName');
    const roomListContainer = document.querySelector('.mainCont');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const deleteRoomBtn = document.getElementById('deleteRoomBtn');
    const fileInput = document.getElementById('file');
    const userInfoContainer = document.getElementById('user-info');
    const sidebar = document.getElementById('sidebar');
    
    // --- Bootstrap Modal Instance ---
    const confirmModalEl = document.getElementById('confirmModal');
    const confirmModal = new bootstrap.Modal(confirmModalEl);
    let modalResolve = null; // To store the promise's resolve function

    // --- User and State Management ---
    const user = JSON.parse(localStorage.getItem('user'));
    let currentRoom = '';

    // --- Authentication Check ---
    if (!user || !user.username) {
        window.location.href = '/'; // Redirect to login if no user data
        return;
    }
    
    // --- Initialize Socket.IO ---
    const socket = io();

    // --- Initial Setup ---
    initializeUser();
    initializeRooms();

    /**
     * Initializes user information in the sidebar.
     */
    function initializeUser() {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        userInfoContainer.innerHTML = `
            <img src="https://placehold.co/40x40/0d6efd/ffffff?text=${(user.firstName || 'U').charAt(0)}" class="rounded-circle me-3" alt="User Avatar">
            <h5 class="mb-0 fw-bold text-truncate">${fullName || user.username}</h5>
        `;
    }

    /**
     * Initializes room list and joins the first available room.
     */
    function initializeRooms() {
        if (!user.roomNos || user.roomNos.length === 0) {
            showConfirmModal("You aren't assigned to any rooms. Please create one.", false).then(() => {
                 // The modal will just close. User can then use 'Create Room' button.
            });
            return;
        }
        renderRoomList();
        // Automatically join the first room in the user's list
        joinRoom(user.roomNos[0]);
    }

    /**
     * Renders the list of rooms in the sidebar.
     */
    function renderRoomList() {
        roomListContainer.innerHTML = ''; // Clear existing list
        user.roomNos.forEach(room => {
            const roomEl = document.createElement('a');
            roomEl.href = '#';
            roomEl.className = 'list-group-item list-group-item-action';
            roomEl.textContent = `Room #${room}`;
            if (room === currentRoom) {
                roomEl.classList.add('active');
            }
            roomEl.addEventListener('click', (e) => {
                e.preventDefault();
                joinRoom(room);
            });
            roomListContainer.appendChild(roomEl);
        });
    }

    /**
     * Joins a specific chat room.
     * @param {string} room - The room number to join.
     */
    function joinRoom(room) {
        if (currentRoom === room) return; // Don't rejoin the same room

        socket.emit('joinRoom', { roomNo: room });
        messagesContainer.innerHTML = ''; // Clear messages from the old room
        currentRoom = room;
        roomNameSpan.innerText = room;
        
        // Update active state in the room list
        const currentActive = roomListContainer.querySelector('.active');
        if (currentActive) currentActive.classList.remove('active');
        
        // Find the new room link and set it to active
        const roomLinks = roomListContainer.getElementsByTagName('a');
        for(let link of roomLinks) {
            if(link.textContent === `Room #${room}`) {
                link.classList.add('active');
                break;
            }
        }

        // On mobile, hide the sidebar after selecting a room
        if (sidebar.classList.contains('active')) {
            toggleSidebar();
        }
        messageInput.focus();
    }
    
    /**
     * Sends a text message to the current room.
     */
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        socket.emit('chat message', {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username, // Send username for identification
            text: text,
            type: 'text' // Specify message type
        });
        messageInput.value = '';
        messageInput.focus();
    }
    
    /**
     * Handles file uploads.
     */
    function handleFileUpload() {
        const files = fileInput.files;
        if (!files.length) return;

        // Using the current room for upload, can be changed to prompt if needed
        const roomNo = currentRoom; 
        
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        formData.append('roomNo', roomNo);

        // Show a loading indicator (optional)
        displayMessage({ text: 'Uploading file(s)...', system: true });

        fetch('/upload-multiple-to-room', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log('Upload successful:', data);
            // The server should emit a 'chat message' for the file,
            // so no need to do anything else here on success.
        })
        .catch(err => {
            console.error('Upload failed:', err);
            displayMessage({ text: 'File upload failed.', system: true, error: true });
        });
        
        // Reset file input
        fileInput.value = '';
    }

    /**
     * Displays a message in the chat window.
     * @param {object} msg - The message object from the server.
     */
    function displayMessage(msg) {
        const isSentByUser = msg.username === user.username;
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `d-flex flex-column ${isSentByUser ? 'align-items-end' : 'align-items-start'} mb-3`;
        messageWrapper.dataset.id = msg.id;

        let messageContent = '';
        if (msg.system) {
            // System messages (like upload status)
            messageContent = `<div class="text-muted fst-italic small">${msg.text}</div>`;
        } else {
            // Regular chat messages
            const senderName = `${msg.firstName || ''} ${msg.lastName || msg.username || 'Anonymous'}`.trim();
            const messageTime = msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            let fileHtml = '';
            if (msg.type === 'file') {
                fileHtml = `<a href="${msg.fileUrl}" target="_blank" class="text-decoration-none d-block mt-1">
                                <i class="bi bi-file-earmark-arrow-down"></i> 📎 ${msg.text}
                            </a>`;
            } else {
                fileHtml = `<div class="text-break">${msg.text}</div>`;
            }

            messageContent = `
                <div class="message ${isSentByUser ? 'sent' : 'received'} rounded p-2 px-3">
                    <div class="fw-bold small">${isSentByUser ? 'You' : senderName}</div>
                    ${fileHtml}
                    <div class="text-end small mt-1 opacity-75">${messageTime}</div>
                </div>
            `;
        }
        
        messageWrapper.innerHTML = messageContent;
        messagesContainer.appendChild(messageWrapper);
        
        // Add delete functionality on double click for messages sent by the user
        if (isSentByUser && !msg.system) {
            messageWrapper.addEventListener('dblclick', () => {
                showConfirmModal(`Are you sure you want to delete this message?`).then(confirmed => {
                    if (confirmed) {
                        socket.emit('delete message', msg.id);
                    }
                });
            });
        }

        // Scroll to the bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Shows a confirmation modal.
     * @param {string} message - The message to display in the modal.
     * @param {boolean} showCancel - Whether to show the 'No' button.
     * @returns {Promise<boolean>} - A promise that resolves with true (Yes) or false (No).
     */
    function showConfirmModal(message, showCancel = true) {
        return new Promise(resolve => {
            modalResolve = resolve; // Store resolve function to be called by button handlers
            confirmModalEl.querySelector('.modal-body p').textContent = message;
            const noButton = confirmModalEl.querySelector('.modal-footer .btn-secondary');
            noButton.style.display = showCancel ? 'inline-block' : 'none';
            confirmModal.show();
        });
    }

    /**
     * Handles the response from the confirmation modal buttons.
     * @param {boolean} response - The user's response (true for 'Yes', false for 'No').
     */
    window.handleResponse = (response) => {
        if (modalResolve) {
            modalResolve(response);
        }
        confirmModal.hide();
    };


    // --- Event Listeners ---

    // Send message on button click or Enter key
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevents new line on enter
            sendMessage();
        }
    });
    
    // Handle file selection
    fileInput.addEventListener('change', handleFileUpload);
    
    // Create Room
    createRoomBtn.addEventListener('click', async () => {
        const newRoom = prompt('Enter new room number:');
        if (!newRoom || newRoom.trim() === '') return;

        try {
            const res = await fetch('/create-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, password: user.password, newRoomNo: newRoom.trim() })
            });
            if (res.ok) {
                alert('Room created successfully!');
                user.roomNos.push(newRoom.trim());
                localStorage.setItem('user', JSON.stringify(user));
                renderRoomList(); // Re-render the list with the new room
                joinRoom(newRoom.trim());
            } else {
                const error = await res.text();
                alert(`Failed to create room: ${error}`);
            }
        } catch (err) {
            console.error('Error creating room:', err);
            alert('An error occurred while creating the room.');
        }
    });

    // Delete Room
    deleteRoomBtn.addEventListener('click', async () => {
        const roomToDelete = prompt('Enter room number to delete:');
        if (!roomToDelete || roomToDelete.trim() === '') return;

        const confirmed = await showConfirmModal(`Are you sure you want to delete room "${roomToDelete}"? This cannot be undone.`);
        if (!confirmed) return;

        try {
            const res = await fetch('/delete-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, password: user.password, roomNo: roomToDelete.trim() })
            });
            if (res.ok) {
                alert('Room deleted successfully!');
                user.roomNos = user.roomNos.filter(r => r !== roomToDelete.trim());
                localStorage.setItem('user', JSON.stringify(user));
                renderRoomList();
                // If the deleted room was the current one, join the first available room
                if (currentRoom === roomToDelete.trim()) {
                    joinRoom(user.roomNos[0] || '');
                }
            } else {
                const error = await res.text();
                alert(`Failed to delete room: ${error}`);
            }
        } catch (err) {
            console.error('Error deleting room:', err);
            alert('An error occurred while deleting the room.');
        }
    });
    
    // --- Socket.IO Event Handlers ---
    socket.on('chat message', (msg) => {
        displayMessage(msg);
    });

    socket.on('delete message', (id) => {
        const el = document.querySelector(`[data-id='${id}']`);
        if (el) el.remove();
    });

    socket.on('connect_error', (err) => {
        console.error("Connection Error:", err.message);
        displayMessage({ text: 'Disconnected from server. Trying to reconnect...', system: true, error: true });
    });
    
    socket.on('connect', () => {
        console.log('Connected to server with socket ID:', socket.id);
        // Re-join room on successful reconnection
        if (currentRoom) {
            socket.emit('joinRoom', { roomNo: currentRoom });
        }
    });
});

/**
 * Toggles the sidebar visibility on mobile.
 */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    const overlay = document.querySelector('.chat-overlay');
    // The overlay is controlled by CSS based on the sidebar's 'active' class
}

/**
 * Logs the user out.
 */
function logout() {
    localStorage.removeItem('user');
    window.location.href = '/';
}


