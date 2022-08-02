import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
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
    port: process.env.PORT,
    url: process.env.RAILWAY_STATIC_URL,
    env: process.env.RAILWAY_ENVIRONMENT
  });
});

let timer: NodeJS.Timer;
let progress = 0;

io.on('connection', (socket) => {
  console.log(`socket id: ${socket.id} connected`);

  socket.on('start', () => {
    console.log('start timer');
    timer = setInterval(() => {
      progress += 1;
      io.emit('tick', progress);
    }, 1000);
  });

  socket.on('stop', () => {
    clearInterval(timer);
  });

  socket.on('reset', () => {
    socket.broadcast.emit('reset');
    clearInterval(timer);
    progress = 0;
  });

  socket.on('disconnect', () => {
    console.log(`socket id: ${socket.id} disconnected`);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Listening on port ${process.env.PORT}`);
  console.log(`   PORT => ${process.env.PORT}`);
  console.log(`   RAILWAY_STATIC_URL => ${process.env.RAILWAY_STATIC_URL}`);
  console.log(`   RAILWAY_ENVIRONMENT => ${process.env.RAILWAY_ENVIRONMENT}`);
});
