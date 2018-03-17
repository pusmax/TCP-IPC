'use strict';

const net = require('net');
const cluster = require('cluster');
const os = require('os');

module.exports = () => {
  const cpusCount = os.cpus().length;

  const workers = [];
  const clients = [];
  const tasks = [];

  //id for clients

  let id = 0;

  const sendTask = data => {
    const worker = workers.find(worker => !worker.isBusy);
    if (worker) {
      worker.send(data);
      worker.isBusy = true;
    } else {
      console.log(
        `--- Please wait, client ${data.clientId}, all workers are busy ---`
      );
      tasks.push(data);
    }
  };

  const sendResult = data => {
    const clientId = data.clientId;
    const client = clients.find(client => client.id === clientId);
    client.write(JSON.stringify(data));
  };

  const checkTasks = () => {
    if (tasks.length) {
      const worker =  workers.find(worker => !worker.isBusy);
      const task = tasks.shift();
      worker.send(task);
    }
  };

  //Create workers

  for (let i = 0; i < cpusCount; i++) {
    const worker = cluster.fork();
    worker.isBusy = false;
    workers.push(worker);
    worker.on('message', (data) => {
      console.log('received Result from worker', worker.process.pid);
      sendResult(data);
      worker.isBusy = false;
      checkTasks();
    });
  }

  //Create server

  const server = net.createServer((socket) => {
    console.log('**New connection**');

    socket.id = id++;

    clients.push(socket);

    socket.on('data', (data) => {
      console.log('received task from client', socket.id);
      const task =  JSON.parse(data);
      const clientId = socket.id;
      sendTask({ task, clientId });
    });

    socket.on('close', () => {
      const indexClient = clients.indexOf(socket);
      clients.splice(indexClient, 1);
      console.log(
        `Client ${socket.id} disconnected`,
        `\nLeft clients: ${clients.length}`
      );
    });

  });

  server.listen(2020, () => {
    console.log('Start listening...');
  });

};
