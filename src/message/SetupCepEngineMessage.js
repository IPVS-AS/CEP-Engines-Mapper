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
          type: "string"
        }
        ]
      }
      ],
      outputs: [
      {
        statement: 'select avg(cast(temperature as int)) from TemperatureEvent.win:time_batch(5 sec)',
        select: 'avg(cast(temperature as int))'
      }
      ]
    };
  }
}

module.exports = SetupCepEngineMessage;
