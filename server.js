const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Configuración de subida de archivos
const upload = multer({
  dest: "uploads/"
});

// Servir carpeta pública
app.use(express.static(path.join(__dirname, "public")));

// Servir archivos subidos
app.use("/uploads", express.static("uploads"));

// Ruta para subir archivos
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    fileUrl: "/uploads/" + req.file.filename,
    originalName: req.file.originalname
  });
});

// Socket.io
io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
