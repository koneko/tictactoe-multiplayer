const socket = io()
const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('id');

let you = ""
let board = []
let current = ""

if (room == null) createRoom()
else joinRoom(room)

function createRoom () {
    let room = Math.floor(Math.random() * (94323344234123 - 12544523)) + 12544523;
    room = room.toString().replace(/4/g, 'v').replace(/1/g, 't').replace(/6/g, 'h').replace(/8/g, 'c')
    window.location.href = `/game?id=${room}`
}

function joinRoom (room) {
    console.log(`Joining room ${room}`)
    socket.emit('join', room)
}

function interpret (text) {
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
    return board[num1][num2]
}

function sendInput (element) {
    let position = element.id;
    if (current != you) return
    if (interpret(position) != "") return
    console.log(`${you} placed ${position}`)
    socket.emit('input', { position, sign: you, id: room })
}

socket.on("roomResponse", data => {
    if (data.response == true) {
        document.querySelector(".state").innerHTML = `Your sign: ${data.sign}`
        console.log("Joined room!")
        you = data.sign
    } else if (data.response == false) {
        alert("Room is full.")
    }
})

socket.on("playerJoin", () => {
    alert("Player joined, starting game.")
})

socket.on('current', data => {
    document.querySelector(".current").innerHTML = `Current player: ${data}`
    if (data == you) {
        document.querySelector(".current").innerHTML += ` (You)`
    }
    current = data
})

socket.on('getBoard', data => {
    function get (id) {
        return document.getElementById(id)
    }
    console.log(data)
    board = []
    board = data
    let tl = get("top-left")
    let tm = get("top-middle")
    let tr = get("top-right")
    let ml = get("middle-left")
    let mm = get("middle-middle")
    let mr = get("middle-right")
    let bl = get("bottom-left")
    let bm = get("bottom-middle")
    let br = get("bottom-right")
    tl.textContent = board[0][0]
    tm.textContent = board[0][1]
    tr.textContent = board[0][2]
    ml.textContent = board[1][0]
    mm.textContent = board[1][1]
    mr.textContent = board[1][2]
    bl.textContent = board[2][0]
    bm.textContent = board[2][1]
    br.textContent = board[2][2]
})

socket.on("winner", data => {
    if (data == "draw") alert("It's a draw!")
    else alert(`${data} won!`)
    let pr = prompt("Rematch? (y/n)")
    if (pr == "y") {
        window.location.reload()
    } else {
        alert("Thanks for playing!")
        window.location.href = "/game"
    }
})

socket.on("leave", () => {
    alert("Other player left the room. Reseting.")
    window.location.href = "/game"
})