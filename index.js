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
    socket.emit('message', formatMessage(botName, "š š¦š®šµš¬šøš¶š® š½šø šš¾š¼š½šš±šŖš½š²š·š°! š¤­\nš š”š¾šµš®š¼: š¤ \nā1 š¤¬š„ŗ šæšš'š ššš šššš¶š ššš½ššš š·š¶š¹šš\n ā2 š ššÆ ššøš¾ š­šøš·'š½ šµš²š“š® š¶š šŖš¹š¹, š­šøš·'š½ š¬šŖšµšµ š²š½ 'š°šøšøš­ ššøš»š­š¼' š²š½'š¼ š·šøš½ š®šŖš¼š š½šø š¶šŖš“š® š¼šøš¶š®š½š±š²š·š° šøš¾š½ šøšÆ š·šøš½š±š²š·š°.\n ā3 š¤ š ššÆ ššøš¾ š±šŖšæš® š²š­š®šŖš¼ šøš» š¼šøš¶š®š½š±š²š·š° ššøš¾ š¹šµšŖš· š½šø šŖš­š­ šøš» š»š®š¶šøšæš®, š¹šµš®šŖš¼š® š®š¶šŖš²šµ š¶š®. \n!!! ššŖš¾š½š²šøš· ššš£šš” šµš®šŖšæš²š·š° š½š±š® š»šøšøš¶, š½š±š® š¬š±šŖš½ š¬šøš·š½š®š·š½ š²š¼ š­š®šµš®š½š®š­ !!!" ));

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