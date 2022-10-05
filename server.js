require('dotenv').config()
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io") 
const formatMessage = require("./utils/messages")
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/user")

const app = express();
const server = http.createServer(app)
const io = socketio(server);
// set static folder
app.use(express.static(path.join(__dirname,'public')));

const botName = 'ChatCord Bot';

// Run when a client connects

io.on('connection',socket =>{
    console.log("new WS connection...");
    socket.on("joinRoom",({username,room}) =>{
       const user = userJoin(socket.id,username,room);
       socket.join(user.room);

        socket.emit('message', formatMessage(botName,'Welcome to chatSystem'));

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));
    

        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });
   
   //listen for chatMessage
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

     // Run when a user disconnects
     socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} left chat`));
      
        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })

    });
})




const PORT = process.env.PORT || 3000;


server.listen(PORT,()=>{
    console.log(`app is listening on port ${PORT}`);
})