var Message = require('./Message');
var Constants = require('./Constants');

class UpdateConsoleMessage extends Message {
  constructor(benchmarks) {
    super(Constants.UpdateConsole);

    this.payload = benchmarks;
  }
}

module.exports = UpdateConsoleMessage;
