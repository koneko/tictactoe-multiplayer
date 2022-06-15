const express = require('express');
const app = express();
const { Server } = require("socket.io");
const port = process.env.PORT || 3000;

let rooms = []

app.use(express.static('public'));

let server = app.listen(port, () => console.log("TicTacToe server listening on port " + port))
const io = new Server(server);

io.on('connection', socket => {
    socket.on('join', id => {
        console.log(`${socket.id} wishes to join room ${id}.`)
        let room = rooms.find(r => r.id == id)
        if (room == null) {
            console.log("Room does not exist, creating room.")
            rooms.push(createRoom(id, socket))
            socket.emit('roomResponse', { response: true, sign: "X" })
            socket.join(id)
        } else {
            if (room.players.length > 1) return socket.emit('roomResponse', { response: false })
            room.players.push({ sign: 'O', socket: socket })
            socket.emit('roomResponse', { response: true, sign: "O" })
            io.to(id).emit('playerJoin')
            socket.join(id)
            io.to(id).emit('current', room.current)
            io.to(id).emit('getBoard', room.board)
            room.state = "playing"
        }
    })

    socket.on("input", (data) => {
        let room = rooms.find(r => r.id == data.id)
        if (room == null) return
        if (room.current != data.sign) return
        if (room.state != "playing") return
        let player = rooms.find(r => r.players.find(p => p.socket.id == socket.id))
        if (player == null) return
        let pos = interpret(data.position, room.board)
        if (room.board[pos[0]][pos[1]] != "") return
        room.board[pos[0]][pos[1]] = data.sign
        room.current = room.current == "X" ? "O" : "X"
        io.to(data.id).emit('current', room.current)
        io.to(data.id).emit('getBoard', room.board)
        // check for winner
        let winner = checkWinner(room.board)
        if (winner != null) {
            io.to(data.id).emit('winner', winner)
            room.state = "finished"
            //delete room
            rooms = rooms.filter(r => r.id != data.id)
        }
    })

    socket.on('disconnect', () => {
        let room = rooms.find(r => r.players.find(p => p.socket.id == socket.id))
        if (room == null) return
        room.players = room.players.filter(p => p.socket.id != socket.id)
        //check is room empty
        if (room.players.length == 0) {
            rooms = rooms.filter(r => r.id != room.id)
        }
        //check is game in progress
        if (room.state == "playing") {
            io.to(room.id).emit('leave')
        }
    })
})

function createRoom (room, socket) {
    return {
        id: room,
        players: [{ sign: 'X', socket: socket }],
        current: "X",
        board: [["", "", ""], ["", "", ""], ["", "", ""]], // top, middle, bottom
        state: "waiting"
    }
}

function interpret (text, board) {
    let res = text.split("-")
    let array = res[0]
    let pos = res[1]
    let num1 = null
    let num2 = null
    switch (array) {
        case "top":
            num1 = 0
            break;
        case "middle":
            num1 = 1
            break;
        case "bottom":
            num1 = 2
            break;
    }
    switch (pos) {
        case "left":
            num2 = 0
            break;
        case "middle":
            num2 = 1
            break;
        case "right":
            num2 = 2
            break;
    }
    return [num1, num2]
}

function checkWinner (board) {
    let winner = null
    // check rows
    if (board[0][0] == board[0][1] && board[0][1] == board[0][2] && board[0][0] != "") winner = board[0][0]
    if (board[1][0] == board[1][1] && board[1][1] == board[1][2] && board[1][0] != "") winner = board[1][0]
    if (board[2][0] == board[2][1] && board[2][1] == board[2][2] && board[2][0] != "") winner = board[2][0]
    // check columns
    if (board[0][0] == board[1][0] && board[1][0] == board[2][0] && board[0][0] != "") winner = board[0][0]
    if (board[0][1] == board[1][1] && board[1][1] == board[2][1] && board[0][1] != "") winner = board[0][1]
    if (board[0][2] == board[1][2] && board[1][2] == board[2][2] && board[0][2] != "") winner = board[0][2]
    // check diagonals
    if (board[0][0] == board[1][1] && board[1][1] == board[2][2] && board[0][0] != "") winner = board[0][0]
    if (board[0][2] == board[1][1] && board[1][1] == board[2][0] && board[0][2] != "") winner = board[0][2]
    //check is whole board full
    if (board.flat().filter(p => p == "").length == 0 && winner == null) winner = "draw"

    return winner
}