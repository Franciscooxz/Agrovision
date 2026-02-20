const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const startSimulation = require("./utils/simulator");

startSimulation(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

// Hacer io global
app.set("io", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});