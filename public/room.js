const socket = io()
const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room');

if (room == null) createRoom()
else joinRoom(room)

function createRoom () {
    let room = Math.floor(Math.random() * (94323344234123 - 12544523)) + 12544523;
    room = room.toString().replace(/4/g, 'v').replace(/1/g, 't').replace(/6/g, 'h').replace(/8/g, 'c')
    window.location.href = `/?room=${room}`
}

function joinRoom (room) {
    console.log(`Joining room ${room}`)
}