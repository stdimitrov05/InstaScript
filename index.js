const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const formatMessage = require('./public/js/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'St_D05 Bot ';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, "😊 𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓽𝓸 𝓙𝓾𝓼𝓽𝓒𝓱𝓪𝓽𝓲𝓷𝓰! 🤭\n🔔 𝓡𝓾𝓵𝓮𝓼: 🤐 \n№1 🤬🥺 𝐿𝑒𝓉'𝓈 𝓃𝑜𝓉 𝓉𝓇𝑒𝒶𝓉 𝑜𝓉𝒽𝑒𝓇𝓈 𝒷𝒶𝒹𝓁𝓎\n №2 😔 𝓘𝓯 𝔂𝓸𝓾 𝓭𝓸𝓷'𝓽 𝓵𝓲𝓴𝓮 𝓶𝔂 𝓪𝓹𝓹, 𝓭𝓸𝓷'𝓽 𝓬𝓪𝓵𝓵 𝓲𝓽 '𝓰𝓸𝓸𝓭 𝔀𝓸𝓻𝓭𝓼' 𝓲𝓽'𝓼 𝓷𝓸𝓽 𝓮𝓪𝓼𝔂 𝓽𝓸 𝓶𝓪𝓴𝓮 𝓼𝓸𝓶𝓮𝓽𝓱𝓲𝓷𝓰 𝓸𝓾𝓽 𝓸𝓯 𝓷𝓸𝓽𝓱𝓲𝓷𝓰.\n №3 🤗 😘 𝓘𝓯 𝔂𝓸𝓾 𝓱𝓪𝓿𝓮 𝓲𝓭𝓮𝓪𝓼 𝓸𝓻 𝓼𝓸𝓶𝓮𝓽𝓱𝓲𝓷𝓰 𝔂𝓸𝓾 𝓹𝓵𝓪𝓷 𝓽𝓸 𝓪𝓭𝓭 𝓸𝓻 𝓻𝓮𝓶𝓸𝓿𝓮, 𝓹𝓵𝓮𝓪𝓼𝓮 𝓮𝓶𝓪𝓲𝓵 𝓶𝓮. \n!!! 𝓒𝓪𝓾𝓽𝓲𝓸𝓷 𝓐𝓕𝓣𝓔𝓡 𝓵𝓮𝓪𝓿𝓲𝓷𝓰 𝓽𝓱𝓮 𝓻𝓸𝓸𝓶, 𝓽𝓱𝓮 𝓬𝓱𝓪𝓽 𝓬𝓸𝓷𝓽𝓮𝓷𝓽 𝓲𝓼 𝓭𝓮𝓵𝓮𝓽𝓮𝓭 !!!" ));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});


const PORT = process.env.PORT || 2000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));