require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions");

const server = http.createServer(app);
const io = new Server(server);
const userSocketMap = {};

const getAllConnectedMembers = (caveId) => {
    return Array.from(io.sockets.adapter.rooms.get(caveId) || []).map(socketId => ({
        socketId,
        username: userSocketMap[socketId],
    }));
};

io.on("connection", (socket) => {
    console.log(`🔥 Socket connected: ${socket.id}`);

    socket.on(ACTIONS.JOIN, ({ caveId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(caveId);

        const members = getAllConnectedMembers(caveId);
        console.log(`🏠 ${username} joined cave ${caveId}`, members);

        // Notify all members in the cave about the new user
        members.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, { username, socketId: socket.id, members });
        });
    });

      // Listen for OUTPUT_CHANGE and broadcast terminal output
      socket.on(ACTIONS.OUTPUT_CHANGE, ({ caveId, output }) => {
        socket.to(caveId).emit(ACTIONS.OUTPUT_CHANGE, { output });
    });

    //listen the text change on editor
    socket.on(ACTIONS.CODE_CHANGE, ({ caveId, text }) => {
        // console.log(` Received CODE_CHANGE for caveId ${caveId}, broadcasting... on text ${text}`);
        socket.to(caveId).emit(ACTIONS.CODE_CHANGE, { text });
    });

    socket.on("disconnecting", () => {
        const caves = [...socket.rooms];
        caves.forEach((caveId) => {
            socket.to(caveId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });

        delete userSocketMap[socket.id];
    });
});

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Hello from server!");
});

server.listen(port, () => {
    console.log(`🚀 Server is listening on port ${port}`);
});
