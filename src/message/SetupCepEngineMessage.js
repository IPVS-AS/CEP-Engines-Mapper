var Message = require('./Message');
var Constants = require('./Constants');

class SetupCepEngineMessage extends Message {
  constructor(config) {
    super(Constants.SetupCepEngine);

    this.payload = config;
  }
}

module.exports = SetupCepEngineMessage;
