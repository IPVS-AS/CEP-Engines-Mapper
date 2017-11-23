var Message = require('./Message');
var Constants = require('./Constants');

class CreateInstanceMessage extends Message {
  constructor(name, state) {
    super(Constants.CreateInstance);
    this.name = name;
    this.state = state;
  }
}

module.exports = CreateInstanceMessage;
