const { spawn } = require('child_process');
let child, stopping = false;

function start() {
  child = spawn(process.execPath, ['index.js'], { stdio: 'inherit' });
  
  child.on('exit', code => {
    if (stopping) return process.exit(0);
    console.log('Bot exited (' + code + '), restarting in 2s...');
    setTimeout(start, 2000);
  });
}

['SIGTERM', 'SIGINT'].forEach(s => process.on(s, () => {
  stopping = true;
  if (child) child.kill(s); else process.exit(0);
}));

start();