var Message = require('./Message');
var Constants = require('./Constants');

class SetupCepEngineMessage extends Message {
  constructor(broker, endEventName, engine, config) {
    super(Constants.SetupCepEngine);
    this.broker = broker;
    this.endEventName = endEventName;
    this.engine = engine;
    this.config = config;
  }
}

module.exports = SetupCepEngineMessage;
