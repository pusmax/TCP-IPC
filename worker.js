'use strict';

const fn = x => x * 2;

process.on('message', (data) => {
  console.log(`worker ${process.pid} received task`);
  const task = data.task;
  data.result = task.map(fn);
  const randorn = Math.random() * (6000 - 3000);
  setTimeout(() => { process.send(data); }, randorn);
});
