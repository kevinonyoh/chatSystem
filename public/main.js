const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const socket = io();


// Get username and room from url
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

//join chatroom 
socket.emit('joinRoom',{username, room});

//Get room and users
socket.on('roomUsers',({room, users}) =>{
    outputRoomName(room);
    outputUser(users);
})

//message from server

socket.on('message', message =>{
    console.log(message)
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Message submit

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    //get message
    const msg = e.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage',msg);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})


function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span> ${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}


//add room name to Dom

function outputRoomName(room){
   roomName.innerText = room;
}

// add user to dom

function outputUser(users){
    userList.innerHTML =`
     ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}