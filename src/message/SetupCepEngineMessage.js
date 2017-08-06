var Message = require('./Message');
var Constants = require('./Constants');

class SetupCepEngineMessage extends Message {
  constructor() {
    super(Constants.SetupCepEngine);

    this.payload = {
      broker: 'tcp://10.0.14.106:1883',
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
        select: 'AverageTemperature'
      }
      ]
    };
  }
}

module.exports = SetupCepEngineMessage;
