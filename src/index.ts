import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { engine } from 'express-handlebars';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket']
});

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.render('index', {
    url: process.env.RAILWAY_STATIC_URL,
    env: process.env.RAILWAY_ENVIRONMENT
  });
});

let timer: NodeJS.Timer | undefined;
let progress = 0;
let isRunning = false;

const sockets = new Map<string, Socket>();

io.on('connection', (socket) => {
  console.log(`socket id: ${socket.id} connected`);
  sockets.set(socket.id, socket);

  socket.on('start', () => {
    if (!isRunning) {
      console.log('start timer');
      isRunning = true;
      timer = setInterval(() => {
        progress += 1;
        io.emit('tick', progress);
      }, 1000);
    }
  });

  socket.on('stop', () => {
    if (isRunning) {
      console.log('stop timer');
      clearInterval(timer);
      isRunning = false;
    }
  });

  socket.on('reset', () => {
    console.log('reset timer');
    socket.broadcast.emit('reset');
    clearInterval(timer);
    progress = 0;
    isRunning = false;
  });

  socket.on('disconnect', () => {
    console.log(`socket id: ${socket.id} disconnected`);
    sockets.delete(socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Listening on port ${process.env.PORT}`);
  console.log(`   PORT => ${process.env.PORT}`);
  console.log(`   RAILWAY_STATIC_URL => ${process.env.RAILWAY_STATIC_URL}`);
  console.log(`   RAILWAY_ENVIRONMENT => ${process.env.RAILWAY_ENVIRONMENT}`);
});
