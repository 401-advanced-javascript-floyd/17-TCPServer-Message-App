'use strict';
const util = require('util');
const fs = require('fs');
let file = process.argv.slice(2).shift();
const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);
const net = require('net');
const client = new net.Socket();
const LOGGER_PORT = process.env.LOGGER_PORT || 3001;
const LOGGER_HOST = process.env.LOGGER_HOST || 'localhost';
const log = require('./logger');
const eventHub = require('./hub');

client.connect(LOGGER_PORT, LOGGER_HOST, initializeLogger);
setTimeout(() => {
  eventHub.emit('save');
}, 500 + Math.random() * 50);


function initializeLogger() {
  eventHub.on('save', log.save('save'));
  eventHub.on('error', log.error('error'));
  // eventHub.on('update', log('update'));

  function log(eventType) {
    return payload => {
      let json = JSON.stringify({
        eventType, payload
      });
      client.write(`${json}\r\n`);
    };
  }
}


read(file).then(data => {
  alterFile(data);
})

const alterFile = (data) => {
  writeToFile(data.toString().toUpperCase());
};
const writeToFile = (text) => {
  console.log(text)

  write(file, Buffer.from(text)).then(data => {
    console.log(data)

  })
};

