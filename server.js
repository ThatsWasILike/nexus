const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Sistema básico anti-spam simple
const messageCooldown = new Map();

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("chat message", (data) => {
    const now = Date.now();
    const lastMessage = messageCooldown.get(socket.id) || 0;

    // Cooldown de 500ms para evitar spam
    if (now - lastMessage < 500) return;

    messageCooldown.set(socket.id, now);

    // Validar datos
    if (
      typeof data !== "object" ||
      typeof data.user !== "string" ||
      typeof data.text !== "string"
    ) return;

    if (data.text.length > 500) return; // Limitar tamaño

    io.emit("chat message", {
      user: data.user.substring(0, 20),
      text: data.text.substring(0, 500)
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    messageCooldown.delete(socket.id);
  });
});

// PUERTO DINÁMICO PARA RENDER
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Nexus corriendo en puerto " + PORT);
});
