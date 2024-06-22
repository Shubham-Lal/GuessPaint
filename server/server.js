import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { generateUniqueRoomCode } from './utils.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Set-Cookie: cross-site-cookie=whatever; SameSite=None; Secure");
    next();
});

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const io = new Server(server, {
    cors: corsOptions,
});

let rooms = {};
let roomPlayers = {};
let allPlayers = {};

io.on('connection', socket => {
    socket.on('join-room', ({ roomID, playerName }) => {
        socket.join(roomID);
        rooms[socket.id] = roomID;
        allPlayers[socket.id] = playerName;

        if (!roomPlayers[roomID]) roomPlayers[roomID] = [];
        roomPlayers[roomID].push(playerName);

        socket.emit('assign-player-name', playerName);
        socket.broadcast.to(roomID).emit('new-player', playerName);
        socket.emit('players-in-room', roomPlayers[roomID]);
    });

    socket.on('client-ready', () => {
        const roomID = rooms[socket.id];
        if (roomID) {
            socket.broadcast.to(roomID).emit('get-canvas-state');
        }
    });

    socket.on('canvas-state', (state) => {
        const roomID = rooms[socket.id];
        if (roomID) {
            socket.broadcast.to(roomID).emit('canvas-state-from-server', state);
        }
    });

    socket.on('draw-line', ({ prevPoint, currPoint, color, brushThickness }) => {
        const roomID = rooms[socket.id];
        if (roomID) {
            io.to(roomID).emit('draw-line', {
                prevPoint, currPoint, color, brushThickness
            });
        }
    });

    socket.on('clear', () => {
        const roomID = rooms[socket.id];
        if (roomID) {
            io.to(roomID).emit('clear');
        }
    });

    socket.on('disconnect', () => {
        const roomID = rooms[socket.id];
        const playerName = allPlayers[socket.id];

        if (roomID && roomPlayers[roomID]) {
            const index = roomPlayers[roomID].indexOf(playerName);
            if (index !== -1) {
                roomPlayers[roomID].splice(index, 1);
            }

            if (roomPlayers[roomID].length === 0) {
                delete roomPlayers[roomID];
            }
        }

        delete rooms[socket.id];
        delete allPlayers[socket.id];

        if (roomID) {
            io.to(roomID).emit('player-left', playerName);
        }
    });
});

app.get('/', async (req, res, next) => {
    try {
        res.send({
            status: 201, message: "GuessPaint API running!",
            rooms, roomPlayers, allPlayers
        });
    } catch (error) {
        res.send({ message: error });
    }
});

app.get('/create-room', (req, res) => {
    const roomID = generateUniqueRoomCode(rooms);
    res.json({ roomID });
});

app.get('/join-room', (req, res) => {
    const { roomID } = req.query;

    if (roomPlayers[roomID]) {
        res.json({ success: true, roomID });
    } else {
        res.json({ success: false });
    }
});

app.get('/list-rooms', (req, res) => {
    const rooms = Object.keys(roomPlayers).map(roomID => ({
        roomID,
        playerCount: roomPlayers[roomID].length
    }));
    res.json(rooms);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});