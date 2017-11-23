var Message = require('./Message');
var Constants = require('./Constants');

class SetupCepEngineMessage extends Message {
  constructor(broker, endEventName, events, statements) {
    super(Constants.SetupCepEngine);
    this.broker = broker;
    this.endEventName = endEventName;
    this.events = events;
    this.statements = statements;
  }
}

module.exports = SetupCepEngineMessage;
