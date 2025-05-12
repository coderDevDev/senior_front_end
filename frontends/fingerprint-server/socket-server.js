import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});



app.use(express.json({ limit: "50mb" }));  
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());


io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
app.post("/send-fingerprint", (req, res) => {
    const { template, fingerprint_image, ipaddress } = req.body;

    if (!template || !fingerprint_image || !ipaddress) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    console.log(`Received fingerprint data from IP: ${ipaddress}`);

    io.emit("fingerprint_data", { template, fingerprint_image, ipaddress });

    res.json({ success: true, message: "Fingerprint data sent!" });
});


app.post("/match-fingerprint", (req, res) => {
    const { id, ipaddress } = req.body;

    if (!id || !ipaddress) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    console.log(`Matching fingerprint for ID: ${id} from IP: ${ipaddress}`);

    io.emit("match_fingerprint", {id });

    const matchFound = true; 

    res.json({ success: true, matchFound });


});


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Socket.IO Server running on http://localhost:${PORT}`);
});
