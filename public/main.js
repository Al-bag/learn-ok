// import {allIsWell} from './tailwind.js'
// allIsWell()
// veriables
const user = JSON.parse(localStorage.getItem('user'));
const input = document.getElementById('input');

//check user
if (!user) window.location.href = '/';
const socket = io();
//check room
if (!user || !user.roomNos || user.roomNos.length === 0) {
  alert('No rooms assigned. Please contact admin or create one.');
  window.location.href = '/';
}

//auto join in first room
let currentRoom = user.roomNos[0];
function joinRoom(room) {
  socket.emit('joinRoom', { roomNo: room });
  document.getElementById('messages').innerHTML = '';
  currentRoom = room;
}
//join in the room function run
joinRoom(currentRoom);

//show room name
const roomName = document.querySelector('#roomName');
roomName.innerText = currentRoom;

const fullName = `${user.firstName} ${user.lastName}`;

const list = document.getElementById('mainCont');

// go to new room
async function roomsfunc() { const res = await fetch('/rooms');
const rooms = await res.json();
const mainCont = document.querySelector('.mainCont');
mainCont.innerHTML = ''; 
rooms.forEach(u => { const li = document.createElement('div'); li.innerHTML = ` <div class="flex"> <div class="users flex"> <img src="user.png" class="img w-10 h-10 inline-block" alt="User Avatar"> <h4>${u.firstName} ${u.lastName}</h4> </div> <h4 class="go">💬️</h4> </div> `;
  li.classList.add('roomList'); mainCont.appendChild(li);

const goBtn = li.querySelector('.go');
//goBtn function
goBtn.addEventListener('click', () => {
let roomInput = document.querySelector('.room-input');
chatbox.addEventListener('click',()=>{ return roomInput.style.display = 'none';})
if (roomInput.style.display === 'block' && roomInput.value.trim() === !''){
  roomInput.style.display = 'none'; return;
} else {
  roomInput.style.display = 'block';
  roomInput.value = ''; 
roomInput.focus();


  const newRoomInput = roomInput.cloneNode(true); roomInput.parentNode.replaceChild(newRoomInput, roomInput); roomInput = newRoomInput; roomInput.focus();
// enter room
roomInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { 
if (roomInput.value.trim() === '') return;
    const enteredRoom = roomInput.value.trim();
     if (!enteredRoom) { roomName.innerText = currentRoom; roomInput.style.display = 'none'; return; }


if (u.roomNos.includes(enteredRoom)){
  roomName.innerText = enteredRoom;
  joinRoom(enteredRoom);
  
  if (chatbox.style.display === 'none') {
    chatbox.style.display = 'flex';
sidebar.style.display = 'none';
}
input.focus();
} else { alert('invalid room'); roomName.innerText = currentRoom; } 

roomInput.value = ''; 
roomInput.style.display = 'none';

} }); } }


); }); } 

roomsfunc();

// send massage function run
const sendBtn = document.getElementById('sendBtn');
sendBtn.onclick = sendMessage;
document.getElementById('input').addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

// send massage function
function sendMessage() {
  const msg = input.value;
  if (!msg) return;
  socket.emit('chat message', {
    firstName: user.firstName,
    lastName: user.lastName,
    text: msg
 });
  input.value = '';
}

socket.on('chat message', msg => {
  const div = document.createElement('div');
  div.style.margin = "10px";
  div.dataset.id = msg.id;

  const innerDiv = document.createElement('div');
  innerDiv.classList.add('message', 'user');

  const div1 = document.createElement('div');
  div1.classList.add('div' , 'flex');
  const strong = document.createElement('strong');
  strong.textContent = `${msg.firstName || ''} ${msg.lastName || msg.sender || ''}`;
  const span = document.createElement('span');
  span.textContent = msg.time || '';
  div1.appendChild(strong);
  div1.appendChild(span);

  const div2 = document.createElement('div');
  div2.classList.add('div2' ,'whitespace-pre-wrap');

  if (msg.type === 'file') {
    const fileElem = document.createElement('a');
    fileElem.textContent = `📎 ${msg.text}`;
    fileElem.href = msg.fileUrl;
    fileElem.download = msg.text;
    fileElem.target = '_blank';
    fileElem.style.color = '#3498db';
    fileElem.style.textDecoration = 'none';
    div2.appendChild(fileElem);
  } else {
    div2.innerText = msg.text;
  }

  innerDiv.appendChild(div1);
  innerDiv.appendChild(div2);
  div.appendChild(innerDiv);
  document.getElementById('messages').appendChild(div);
        div.addEventListener('dblclick', () => {
    if (user.roomNos.includes(currentRoom)) {

      async function askUser() {
  const result = await customConfirm("Do you want to delete the massage?");
  if (result) {
    socket.emit('delete message', msg.id);
  } 
  } 
      askUser()
          } else {
      alert("You can delete only your rooms massages!");
    }
  });

});



socket.on('delete message', id => {
  const el = document.querySelector(`[data-id='${id}']`);
  if (el) el.remove();
});


// create room function 
document.getElementById('createRoomBtn').onclick = async () => {
  const newRoom = prompt('Enter new room number:');
  if (!newRoom) return;
  const res = await fetch('/create-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user.username, password: user.password, newRoomNo: newRoom })
  });
  if (res.ok) {
    alert('Room created!');
    user.roomNos.push(newRoom);
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    alert('Failed to create room!');
  }
};

// room delete function
document.getElementById('deleteRoomBtn').onclick = async () => {
  const roomToDelete = prompt('Enter room number to delete:');
  if (!roomToDelete) return;
  const res = await fetch('/delete-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user.username, password: user.password, roomNo: roomToDelete })
  });
  if (res.ok) {
    alert('Room deleted!');
    user.roomNos = user.roomNos.filter(r => r !== roomToDelete);
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    alert('Failed to delete room!');
  }
};
// log out
function logout() {
  localStorage.removeItem('user');
  window.location.href = '/';
}

// add user info
const userInfo = document.querySelector('.user-info');
userInfo.innerHTML = `<p><span>Name:</span> ${fullName}</p> <h4 id="go">➔</h4>`;

//
const btn = document.querySelector('#btn');
const sidebar = document.querySelector('.sidebar');
const chatbox = document.querySelector('.chatbox');
const go = document.querySelector('#go');
const fileInputWrapper = document.querySelector('.file-input-wrapper')

go.addEventListener('click',()=>{
 sidebar.style.display = 'none';
chatbox.style.display = 'flex';
 
})

btn.addEventListener('click',()=>{
sidebar.style.display = 'flex';
chatbox.style.display = 'none';

})

input.addEventListener('focus',()=>{
sendBtn.style.display = 'none';
fileInputWrapper.style.display = 'none';
})

input.addEventListener('blur',()=>{
sendBtn.style.display = 'inline-block';
fileInputWrapper.style.display = 'flex';
})



//file transfer function
document.getElementById('file').addEventListener('change', function () {
  const files = this.files;
  const roomNo = prompt('Enter the room no?');
  if (!files.length || !roomNo) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  formData.append('roomNo', roomNo);

  fetch('/upload-multiple-to-room', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      console.log('ok')
    });
});





let confirmCallback;
function customConfirm(message){
  return new Promise((resolve) => {
    document.querySelector("#confirmBox p").textContent = message;
    document.getElementById("confirmBox").style.display = "flex";
    confirmCallback = resolve;
  });
}
function handleResponse(result) {
  document.getElementById("confirmBox").style.display = "none";
  confirmCallback(result);
}


