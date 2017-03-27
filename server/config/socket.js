var lodash = require('lodash');

var activeUsers  = {};
module.exports = function(io) {
    io.on('connection', function (socket) {
        console.log('client connected')
        socket.on('log in', function (data) {
            console.log(data);
            socket.userId = data.id;
            socket.join(data.id);
        })

        socket.on('send-message', function (data) {
            io.sockets.in(data.recipient).emit('message-received', data)
        })

        socket.on('send-chat-message', function (data) {
            data.participants.forEach(function (participant) {
                io.sockets.in(participant).emit('message-received', data)
            })
        })

        socket.on('send-request', function (data) {
            io.sockets.in(data.recipient).emit('request-received', data)
        })

        socket.on('request-accepted', function (data) {
            io.sockets.in(data.id).emit('connected', data.name);
        })

        socket.on('disconnect', function () {
            socket.leave(socket.userId);
        });
    })
}