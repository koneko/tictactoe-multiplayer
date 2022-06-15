const express = require('express');
const app = express();
const { Server } = require("socket.io");
const port = process.env.PORT || 3000;

let rooms = []

app.use(express.static('public'));

let server = app.listen(port, () => console.log("TicTacToe server listening on port " + port))
const io = new Server(server);

io.on('connection', socket => {
    console.log(`${socket.id} connected.`);
})