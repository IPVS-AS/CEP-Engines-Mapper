var Message = require('./Message');
var Constants = require('./Constants');

class UpdateConsoleMessage extends Message {
  constructor(name, state) {
    super(Constants.UpdateInstance);

    this.payload = {
      name: name,
      state: state
    };
  }
}

module.exports = UpdateConsoleMessage;
