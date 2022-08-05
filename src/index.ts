import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { engine } from 'express-handlebars';

import { formatTime } from './helpers';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket']
});

type SessionDurationOption = 15 | 25 | 50;
type NumberOfSessionsOption = 3 | 4 | 5;

interface Settings {
  sessionDuration: SessionDurationOption;
  numberOfSessions: NumberOfSessionsOption;
}

const settings: Settings = {
  sessionDuration: 50,
  numberOfSessions: 3
};
let timer: NodeJS.Timer | undefined;
let progress = 5;
let isRunning = false;
let isBreakActive = false;

const sockets = new Map<string, Socket>();

io.on('connection', (socket) => {
  console.log(`socket id: ${socket.id} connected`);
  sockets.set(socket.id, socket);

  socket.on('start', () => {
    if (!isRunning) {
      socket.broadcast.emit('start');
      console.log('start timer');
      isRunning = true;
      timer = setInterval(() => {
        if (progress === 0) {
          clearInterval(timer);
          isRunning = false;
          switch (settings.sessionDuration) {
            case 15:
            case 25:
              progress = (!isBreakActive ? 5 : 25) * 60;
              break;
            case 50:
              progress = (!isBreakActive ? 10 : 50) * 60;
              break;
            default:
              progress = (!isBreakActive ? 5 : 25) * 60;
          }
          isBreakActive = !isBreakActive;
          io.emit('set break mode', isBreakActive);
        } else {
          progress -= 1;
        }
        io.emit('tick', progress);
      }, 1000);
    }
  });

  socket.on('stop', () => {
    if (isRunning) {
      console.log('stop timer');
      socket.broadcast.emit('stop');
      clearInterval(timer);
      isRunning = false;
    }
  });

  socket.on('reset', () => {
    console.log('reset timer');
    clearInterval(timer);
    progress = settings.sessionDuration * 60;
    isRunning = false;
    io.emit('tick', progress);
  });

  socket.on('set session duration', (duration: SessionDurationOption) => {
    if (isRunning) {
      return;
    }
    settings.sessionDuration = duration;
    progress = settings.sessionDuration * 60;
    socket.broadcast.emit('tick', progress);
  });

  socket.on(
    'set number of sessions',
    (numberOfSessions: NumberOfSessionsOption) => {
      if (isRunning) {
        return;
      }

      settings.numberOfSessions = numberOfSessions;
    }
  );

  socket.on('disconnect', () => {
    console.log(`socket id: ${socket.id} disconnected`);
    sockets.delete(socket.id);
  });
});

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.render('index', {
    url: process.env.RAILWAY_STATIC_URL,
    env: process.env.RAILWAY_ENVIRONMENT,
    currentTime: formatTime(progress),
    sessionDuration: settings.sessionDuration,
    numberOfSessions: settings.numberOfSessions,
    isRunning
  });
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Listening on port ${process.env.PORT}`);
  console.log(`   PORT => ${process.env.PORT}`);
  console.log(`   RAILWAY_STATIC_URL => ${process.env.RAILWAY_STATIC_URL}`);
  console.log(`   RAILWAY_ENVIRONMENT => ${process.env.RAILWAY_ENVIRONMENT}`);
});
