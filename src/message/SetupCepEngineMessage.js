var Message = require('./Message');
var Constants = require('./Constants');

class SetupCepEngineMessage extends Message {
  constructor() {
    super(Constants.SetupCepEngine);

    this.payload = {
      broker: 'tcp://test.mosquitto.org:1883',
      inputs: [
      {
        topic: 'TemperatureEvent',
        properties: [
        {
          property: "temperature",
          type: "int"
        }
        ]
      }
      ],
      outputs: [
      {
        statement: 'select avg(temperature) from TemperatureEvent.win:time_batch(5 sec)',
        select: 'avg(temperature)'
      }
      ]
    };
  }
}

module.exports = SetupCepEngineMessage;
