
/**
 * =================================================================
 * Main JavaScript for VibeChat
 * =================================================================
 * This script handles user authentication, room management,
 * real-time messaging via Socket.IO, and all UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    const roomNameSpan = document.getElementById('roomName');
    const roomListContainer = document.querySelector('.mainCont');
    const userListContainer = document.getElementById('user-list');
    const fileInput = document.getElementById('file');
    const userInfoContainer = document.getElementById('user-info');
    const sidebar = document.getElementById('sidebar');
    const typingIndicator = document.getElementById('typing-indicator');

    // --- Bootstrap Modal Instance & State ---
    const appModalEl = document.getElementById('appModal');
    const appModal = new bootstrap.Modal(appModalEl);
    let modalCallback = null;

    // --- User and State Management ---
    const user = JSON.parse(localStorage.getItem('user'));
    let currentRoom = '';
    let typingTimeout;

    // --- Authentication Check ---
    `if (!user || !user.username) {
        window.location.href = '/'; // Redirect to login if no user data
        return;
    }`
    
    // --- Initialize Socket.IO ---
    const socket = io();

    // --- Initial Setup ---
    initializeUser();
    initializeRooms();

    /**
     * Sets up the user's profile information in the sidebar.
     */
    function initializeUser() {
        const fullName = (`${user.firstName || ''} ${user.lastName || ''}`).trim();
        userInfoContainer.innerHTML = `
            <img src="https://placehold.co/40x40/7c3aed/ffffff?text= ${(user.firstName || user.username).charAt(0).toUpperCase()}" class="rounded-circle me-3" alt="User Avatar">
            <div>
                <h5 class="mb-0 fw-bold text-truncate">${fullName || user.username}</h5>
                <small class="text-muted">@ ${user.username}</small>
            </div>
        `;
    }

    /**
     * Renders the initial room list and joins the first room.
     */
    function initializeRooms() {
        if (!user.roomNos || user.roomNos.length === 0) {
            showModal('No Rooms', "You aren't in any rooms yet.", [{ label: 'Close', class: 'btn-secondary' }]);
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
            roomEl.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
            roomEl.dataset.room = room;
            roomEl.innerHTML = `
                <span><i class="bi bi-hash me-2"></i>${room}</span>
            `;
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
        if (currentRoom === room && socket.connected) return;

        socket.emit('joinRoom', { roomNo: room, user });
        messagesContainer.innerHTML = ''; // Clear messages from the old room
        currentRoom = room;
        roomNameSpan.innerText = room;
        
        // Update active state in the room list
        document.querySelectorAll('.mainCont .list-group-item-action').forEach(el => {
            el.classList.toggle('active', el.dataset.room === room);
        });

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
            username: user.username,
            text: text,
            type: 'text'
        });
        
        socket.emit('stop typing');
        messageInput.value = '';
        messageInput.focus();
    }
    
    /**
     * Handles file uploads via a POST request.
     */
    function handleFileUpload() {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomNo', currentRoom);
        formData.append('username', user.username);
        formData.append('firstName', user.firstName || '');
        formData.append('lastName', user.lastName || '');

        // Show a temporary "uploading" message
        const tempId = `temp-${Date.now()}`;
        displayMessage({
            id: tempId,
            system: 'upload',
            text: `Uploading ${file.name}...`
        });

        fetch('/upload-file', {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Upload failed');
            }
            return res.json();
        })
        .then(data => {
            // The server will broadcast the message, so we just need to remove the temp one.
            // The server-sent message will have a proper ID.
            const tempEl = document.querySelector(`[data-id='${tempId}']`);
            if (tempEl) tempEl.remove();
        })
        .catch(err => {
            console.error('Upload failed:', err);
            const tempEl = document.querySelector(`[data-id='${tempId}']`);
            if (tempEl) {
                tempEl.innerHTML = `<div class="text-danger fst-italic small">Upload failed for \${file.name}</div>`;
            }
        })
        .finally(() => {
            fileInput.value = ''; // Reset file input
        });
    }

    /**
     * Displays a single message or a system notification in the chat window.
     * @param {object} msg - The message object from the server.
     */
    function displayMessage(msg) {
        const isSentByUser = msg.username === user.username;
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `d-flex flex-column ${isSentByUser ? 'align-items-end' : 'align-items-start'} mb-3`;
        messageWrapper.dataset.id = msg.id;

        let messageContent = '';

        if (msg.system === 'upload') {
             messageContent = `<div class="text-muted fst-italic small">${msg.text}</div>`;
        } else {
            const senderName = isSentByUser ? 'You' : (`${msg.firstName || ''} ${msg.lastName || ''}`).trim() || msg.username;
            const messageTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            let fileHtml = '';
            if (msg.type === 'file') {
                fileHtml = `<a href="${msg.fileUrl}" target="_blank" class="text-decoration-none d-block mt-1">
                                <i class="bi bi-file-earmark-arrow-down"></i> ${msg.text}
                            </a>`;
            } else {
                // Sanitize text content to prevent HTML injection
                const textEl = document.createElement('div');
                textEl.className = 'text-break';
                textEl.textContent = msg.text;
                fileHtml = textEl.outerHTML;
            }

            messageContent = `
                <div class="message-bubble ${isSentByUser ? 'sent' : 'received'}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="fw-bold small">${senderName}</div>
                        ${isSentByUser ? `<i class="bi bi-trash3 ms-2 delete-icon" onclick="requestDeleteMessage('${msg.id}')" title="Delete Message"></i>` : ''}
                    </div>
                    \
                    ${fileHtml}
                    <div class="text-end small mt-1 opacity-75">${messageTime}</div>
                </div>
            `;
        }
        
        messageWrapper.innerHTML = messageContent;
        messagesContainer.appendChild(messageWrapper);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Prompts the user for confirmation before deleting a message.
     */
    window.requestDeleteMessage = (id) => {
        showModal(
            'Delete Message', 
            'Are you sure you want to delete this message?', 
            [
                { label: 'Cancel', class: 'btn-secondary' },
                { label: 'Delete', class: 'btn-danger', action: () => socket.emit('delete message', id) }
            ]
        );
    };

    /**
     * A versatile function to show a Bootstrap modal.
     * @param {string} title - The title of the modal.
     * @param {string} body - The HTML or text content for the modal body.
     * @param {Array<object>} buttons - An array of button objects {label, class, action}.
     */
    function showModal(title, body, buttons = []) {
        appModalEl.querySelector('.modal-title').textContent = title;
        appModalEl.querySelector('.modal-body').innerHTML = body;
        const footer = appModalEl.querySelector('.modal-footer');
        footer.innerHTML = ''; // Clear old buttons

        buttons.forEach(btnInfo => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `btn ${btnInfo.class}`;
            button.textContent = btnInfo.label;
            button.addEventListener('click', () => {
                if (btnInfo.action) {
                    btnInfo.action();
                }
                appModal.hide();
            });
            footer.appendChild(button);
        });

        // Add a default close button if no buttons are provided
        if (buttons.length === 0) {
            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = 'btn btn-secondary';
            closeButton.textContent = 'Close';
            closeButton.dataset.bsDismiss = 'modal';
            footer.appendChild(closeButton);
        }

        appModal.show();
    }


    // --- Event Listeners ---

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', () => {
        socket.emit('typing');
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('stop typing');
        }, 2000); // 2 seconds of inactivity
    });

    fileInput.addEventListener('change', handleFileUpload);
    
    // --- Socket.IO Event Handlers ---
    socket.on('chatHistory', (messages) => {
        messagesContainer.innerHTML = ''; // Clear before loading history
        messages.forEach(msg => displayMessage(msg));
    });

    socket.on('chat message', (msg) => {
        displayMessage(msg);
    });

    socket.on('delete message', (id) => {
        const el = document.querySelector(`[data-id='${id}']`);
        if (el) el.remove();
    });

    socket.on('updateUserList', (users) => {
        userListContainer.innerHTML = '';
        users.forEach(u => {
            const userEl = document.createElement('div');
            userEl.className = 'list-group-item list-group-item-action border-0';
            userEl.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="https://placehold.co/32x32/4b5563/ffffff?text= ${(u.firstName || u.username).charAt(0).toUpperCase()}" class="rounded-circle me-2" alt="Avatar">
                    <span class="text-truncate">${u.firstName || u.username}</span>
                    <i class="bi bi-circle-fill text-success small ms-auto" title="Online"></i>
                </div>
            `;
            userListContainer.appendChild(userEl);
        });
    });

    socket.on('typing', (typingUsers) => {
        if (typingUsers.length === 0) {
            typingIndicator.textContent = '';
        } else if (typingUsers.length === 1) {
            typingIndicator.textContent = `${typingUsers[0]} is typing...`;
        } else {
            typingIndicator.textContent = `${typingUsers.join(', ')} are typing...`;
        }
    });

    socket.on('connect_error', (err) => {
        console.error("Connection Error:", err.message);
        displayMessage({ system: 'upload', text: 'Disconnected. Attempting to reconnect...' });
    });
    
    socket.on('connect', () => {
        console.log('Connected to server with socket ID:', socket.id);
        if (currentRoom) {
            joinRoom(currentRoom);
        }
    });
});

/**
 * Toggles the sidebar visibility on mobile.
 */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.chat-overlay').classList.toggle('active');
}

/**
 * Logs the user out by clearing local storage and redirecting.
 */
function logout() {
    localStorage.removeItem('user');
    window.location.href = '/';
      }
                                                     
