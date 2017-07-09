var mqtt = require('mqtt');

function start(publishCount) {
  var client = mqtt.connect('mqtt://test.mosquitto.org');

  client.on('connect', () => {
    setIntervalN(() => {
      var temperature = randomInt(0, 500);
      client.publish('temperature', temperature.toString());
    }, 500, publishCount, () => {
      client.end();
    });
  });
}

function setIntervalN(callback, delay, repetitions, end) {
  var i = 0;
  var intervalId = setInterval(() => {
    callback();

    if (++i === repetitions) {
      clearInterval(intervalID);
      end();
    }
  }, delay);
}

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

module.exports.start = start;
