var Message = require('./Message');
var Constants = require('./Constants');

class BenchmarkEndMessage extends Message {
  constructor() {
    super(Constants.BenchmarkEnd);
  }
}

module.exports = BenchmarkEndMessage;
