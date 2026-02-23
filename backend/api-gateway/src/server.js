const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const startSimulation = require('./utils/simulator');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unirse a sala personal por userId
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} unido a sala ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Hacer io global para usarlo en controllers
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  // Iniciar simulador de sensores
  startSimulation(app);
});
