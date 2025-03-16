require('dotenv').config();
const express = require("express");
const app = express()
const http = require("http")
const { Server } = require("socket.io"); // importing a class 'Server'
const ACTIONS = require('./Actions');


const server = http.createServer(app)
const io = new Server(server) //object of class Server, makes a socket.io server of our app server
const userSocketMap = {}

const getAllConnectedMembers = (caveId) => {
    return Array.from(io.sockets.adapter.rooms.get(caveId) || []).map(socketId => {
        return {
            socketId,
            username: userSocketMap[socketId]
        }
    })
}

//if socket is connected then this will pass that socket to the callback function
io.on("connection", (socket) => {
    console.log(`Socket connected : ${socket.id}`);
    socket.on(ACTIONS.JOIN, ({ caveId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(caveId);
        const members = getAllConnectedMembers(caveId)
        console.log(members);
        members.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED, { username, socketId: socket.id , members})
        })
        
    })
})
io.on("disconnecting", (socket) => {
    const caves = [...socket.rooms];
    caves.forEach(caveId => {
        socket.in(caveId).emit(ACTIONS.DISCONNECTED, {socketId : socket.id, username : userSocketMap[socket.id]})
    })
    delete userSocketMap[socket.id]
    socket.leave()
})

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("hello")
})

server.listen(port, () => {
    console.log(`this server is listening on port ${port}`);

})