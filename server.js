const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let users = [];
let messageHistory = [];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('file upload', (msg) => {
        messageHistory.push(msg);
        io.emit('file upload', msg);
    });

    socket.on('edit message', ({ messageId, editedMessage }) => {

        io.emit('update message', { messageId, editedMessage });
    });
    
    socket.emit('message history', messageHistory);

    socket.on('add user', (username) => {
        users.push({ id: socket.id, name: username });
        io.emit('user list', users);
    });

    socket.on('chat message', (msg) => {
        messageHistory.push(msg);
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        users = users.filter(user => user.id !== socket.id);
        io.emit('user list', users);
    });

    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
