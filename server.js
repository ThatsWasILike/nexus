const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// ======= Crear carpeta uploads si no existe =======
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ======= Configuración de subida =======
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ======= Middleware =======
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));
app.use(express.json());

// ======= Ruta subida archivos =======
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    fileUrl: "/uploads/" + req.file.filename,
    originalName: req.file.originalname
  });
});

// ======= Socket.IO =======
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("join", (username) => {
    socket.username = username;
    io.emit("system message", `${username} se ha unido al chat`);
  });

  socket.on("chat message", (data) => {
    const messageData = {
      username: socket.username || "Anónimo",
      message: data,
      time: new Date().toLocaleTimeString()
    };

    io.emit("chat message", messageData);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("system message", `${socket.username} salió del chat`);
    }
  });
});

// ======= Iniciar servidor =======
server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
