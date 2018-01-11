var Message = require('./Message');
var Constants = require('./Constants');

class BenchmarksMessage extends Message {
  constructor(benchmarks) {
    super(Constants.Benchmarks);
    this.benchmarks = benchmarks;
  }
}

module.exports = BenchmarksMessage;
