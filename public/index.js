(async function (global) {
  const isProduction = global.ENV === 'production';
  const protocol = isProduction ? 'https://' : 'http://';
  const socket = global.io(`${protocol}${global.STATIC_URL}:${global.PORT}`);

  const startBtn = global.document.querySelector('.start');
  const stopBtn = global.document.querySelector('.stop');
  const resetBtn = global.document.querySelector('.reset');
  const time = global.document.querySelector('.time__value');

  let current = 0;

  startBtn.addEventListener('click', () => {
    socket.emit('start');
  });

  stopBtn.addEventListener('click', () => {
    socket.emit('stop');
  });

  resetBtn.addEventListener('click', () => {
    socket.emit('reset');
    current = 0;
    time.innerText = formatTime();
  });

  socket.on('tick', (progress) => {
    current = progress;
    time.innerText = formatTime();
  });

  socket.on('reset', () => {
    current = 0;
    time.innerText = formatTime();
  });

  function formatTime() {
    const hours = `${~~(current / 3600)}`.padStart(2, '0');
    const minutes = `${~~((current % 3600) / 60)}`.padStart(2, '0');
    const seconds = `${~~(current % 60)}`.padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
})(window);
