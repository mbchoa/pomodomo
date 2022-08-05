(async function (global) {
  const isProduction = global.ENV === 'production';
  const protocol = isProduction ? 'https://' : 'http://';
  const socket = global.io(`${protocol}${global.STATIC_URL}`, {
    transports: ['websocket']
  });

  const startBtn = global.document.querySelector('.start');
  const stopBtn = global.document.querySelector('.stop');
  const resetBtn = global.document.querySelector('.reset');
  const time = global.document.querySelector('.time__value');
  const fifteenMinuteBtn = global.document.querySelector('.fifteen');
  const twentyFiveMinuteBtn = global.document.querySelector('.twentyfive');
  const fiftyMinuteBtn = global.document.querySelector('.fifty');

  let current = global.SESSION_DURATION * 60;
  let isRunning = global.RUNNING;

  startBtn.addEventListener('click', () => {
    socket.emit('start');
    isRunning = true;
  });

  stopBtn.addEventListener('click', () => {
    socket.emit('stop');
    isRunning = false;
  });

  resetBtn.addEventListener('click', () => {
    socket.emit('reset');
    isRunning = false;
  });

  fifteenMinuteBtn.addEventListener('click', () => {
    if (!isRunning) {
      socket.emit('set session duration', 15);
      current = 15 * 60;
      time.innerText = formatTime();
    }
  });

  twentyFiveMinuteBtn.addEventListener('click', () => {
    if (!isRunning) {
      socket.emit('set session duration', 25);
      current = 25 * 60;
      time.innerText = formatTime();
    }
  });

  fiftyMinuteBtn.addEventListener('click', () => {
    if (!isRunning) {
      socket.emit('set session duration', 50);
      current = 50 * 60;
      time.innerText = formatTime();
    }
  });

  socket.on('start', () => {
    isRunning = true;
  });

  socket.on('tick', (progress) => {
    current = progress;
    time.innerText = formatTime();
  });

  socket.on('stop', () => {
    isRunning = false;
  });

  socket.on('set session duration', (duration) => {
    current = duration;
    time.innerText = formatTime();
  });

  function formatTime() {
    const minutes = `${~~((current % 3600) / 60)}`.padStart(2, '0');
    const seconds = `${~~(current % 60)}`.padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
})(window);
