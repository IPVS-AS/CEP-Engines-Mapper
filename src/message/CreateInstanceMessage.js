var Message = require('./Message');
var Constants = require('./Constants');

class CreateInstanceMessage extends Message {
  constructor(name, state) {
    super(Constants.CreateInstance);

    this.payload = {
      name: name,
      state: state
    };
  }
}

module.exports = CreateInstanceMessage;
