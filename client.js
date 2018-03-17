'use strict';

const net = require('net');

//Generate 10 clients with different time to connect

const delay = (task, randorn) => setTimeout(() => {

  const socket = net.createConnection(2020, () => {
    socket.write(JSON.stringify(task));
    socket.on('data', (data) => {
      const { result, clientId } = JSON.parse(data);
      console.log(`Result to client ${clientId}: ${result}`);
      socket.end();
    });

  });

}, randorn);

for (let i = 0; i < 10; i++) {
  const randorn = Math.random() * (5000 - 2000);
  const task = [i, i + 5, i + 10];
  delay(task, randorn);
}
