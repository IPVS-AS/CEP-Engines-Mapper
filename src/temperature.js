var mqtt = require('mqtt');
var config = require('config');

function start(broker, publishCount) {
  console.log('Connect mqtt');
  var client = mqtt.connect(broker);

  client.on('connect', () => {
    setIntervalN(
      () => {
        var temperatureEvent = {
          temperature: randomInt(0, 500)
        };
        console.log('Publish temperature: ' + temperatureEvent.temperature);
        client.publish('TemperatureEvent', JSON.stringify(temperatureEvent));
      },
      500,
      publishCount,
      () => {
        client.publish('TemperatureEndEvent', JSON.stringify({ end: true }));
        client.end();
      }
    );
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

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

module.exports.start = start;
