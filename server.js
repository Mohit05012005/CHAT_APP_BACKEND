const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');  // assuming this returns the express app
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// ← Create io BEFORE listening
const io = new Server(server, {
  cors: {
    origin: "*",              // Allow Postman and frontend
    methods: ["GET", "POST"]
  }
});

const room = []          // list of room ids 
const rooms = {         // number of ids in a room  
}

const createRoomId = ()=>{
  let roomId = Math.random().toString(36).substring(2,7);
  console.log("Room ID created:",roomId);
  room.push(roomId);
  return roomId;
}

io.on('connection', (socket) => {
  console.log("New user connected:", socket.id);
socket.on("createRoom", (data, callback) => {
  if (!data?.name?.trim()) {
    return callback({
      status: "error",
      message: "Invalid name"
    });
  }

  const roomId = createRoomId();
  rooms[roomId] = [data.name];

  // socket.join(roomId);

  callback({
    status: "ok",
    roomId,
    users: rooms[roomId],
    time: new Date()
  });
});


  // after creating the room
  
  socket.on('joinRoom',(data,callback)=>{
    console.log(data);
    let roomId = data.roomId;
    if(room.includes(roomId)){
      console.log("here inside the room");
      if(!rooms[roomId].includes(data.name)){
        rooms[roomId].push(data.name);
      }
      socket.join(roomId);
      io.to(roomId).emit('totalUser',{users:rooms[roomId]})
      socket.to(roomId).emit("userJoined",{name:data.name,users:rooms[roomId],time:new Date()});
      callback({
        status:"ok",
        users:rooms[roomId],
        time:new Date()
      })
    }else{
      callback({
        status:"error",
        message:"Room does not exitst"
      })
      return;
    }
  });

  // after checking the password
  socket.on('checkPass',(data,callback)=>{
    let roomId = data.roomId;
      if(room.includes(roomId)){
      console.log("here inside the room");
      callback({
        status:"ok",
        time:new Date()
      })
    }else{
      callback({
        status:"error",
        message:"Room does not exitst"
      })
      return;
    }
  })

  // after joining the room

  socket.on('sendMessage',(data)=>{
    console.log("Message received at server:",data);
    if(data.name === "askAI"){
       io.to(data.roomId).emit("receiveMessage",{name:data.name,message:data.message,time:new Date()});
    }else{
       socket.to(data.roomId).emit("receiveMessage",{name:data.name,message:data.message ,time:new Date()});
    }

  })


  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
    
    // socket.to(roomId).emit('userDisconnected',"Someone disconnected!");
  });
});

// Now start listening
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});