var Message = require('./Message');
var Constants = require('./Constants');

class SetupCepEngineMessage extends Message {
  constructor() {
    super(Constants.SetupCepEngine);

    this.payload = {
      broker: 'tcp://10.0.14.106:1883',
      events: [
      {
        eventName: 'TemperatureEvent',
        properties: [
        {
          property: "temperature",
          type: "int"
        }
        ]
      }
      ],
      statements: [
      {
        statementName: 'AverageTemperature',
        statement: 'select avg(temperature) from TemperatureEvent.win:time_batch(5 sec)'
      }
      ]
    };
  }
}

module.exports = SetupCepEngineMessage;
