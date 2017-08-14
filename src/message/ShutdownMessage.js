var Message = require('./Message');
var Constants = require('./Constants');

class ShutdownMessage extends Message {
  constructor() {
    super(Constants.Shutdown);
  }
}

module.exports = ShutdownMessage;
