var mqtt = require('mqtt');

function start(publishCount, callback) {
  var client = mqtt.connect('mqtt://test.mosquitto.org');

  client.on('connect', () => {
    setIntervalN(() => {
      var temperatureEvent = {
        temperature: randomInt(0, 500)
      };
      console.log("Publish temperature: " + temperatureEvent.temperature);
      client.publish('TemperatureEvent', JSON.stringify(temperatureEvent));
    }, 500, publishCount, () => {
      client.end();
      if (callback) {
        callback();
      }
    });
  });
}

function setIntervalN(callback, delay, repetitions, end) {
  var i = 0;
  var intervalId = setInterval(() => {
    callback();

    if (++i === repetitions) {
      clearInterval(intervalId);
      end();
    }
  }, delay);
}

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

module.exports.start = start;
