var EventEmitter = require('events');
var Constants = require('./constants');

var Instance = require('./instance');

class Benchmark extends EventEmitter {
  constructor(broker, endEventName, instances) {
    super();
    this.name = Benchmark.generateName();
    this.broker = broker;
    this.endEventName = endEventName;
    this.instances = {};

    var self = this;
    instances.forEach(i => {
      var instance = new Instance(self.name, i.engine, i.config);
      self.instances[instance.name] = instance;

      instance.on('changeState', state => {
        this.emit('changeState', instance.name, state);
      });
    });
  }

  start() {
    for (var name in this.instances) {
      if (this.instances.hasOwnProperty(name)) {
        this.instances[name].create(
          () => {},
          err => {
            console.log(err);
          }
        );
      }
    }
  }

  readyInstance(instance) {
    if (this.instances.hasOwnProperty(instance)) {
      this.instances[instance].changeState(Constants.State.Ready);

      if (this.benchmarkIsReady()) {
        this.emit('ready');

        for (var instance in this.instances) {
          if (this.instances.hasOwnProperty(instance)) {
            this.instances[instance].changeState(Constants.State.Benchmarking);
          }
        }
      }
    }
  }

  benchmarkIsReady() {
    for (var instance in this.instances) {
      if (this.instances.hasOwnProperty(instance)) {
        if (this.instances[instance].state != Constants.State.Ready) {
          return false;
        }
      }
    }

    return true;
  }

  static generateName() {
    return 'benchmark-' + Math.random().toString(36).substr(2, 10);
  }
}

module.exports = Benchmark;
