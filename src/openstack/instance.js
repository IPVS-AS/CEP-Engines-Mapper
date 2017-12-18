var fs = require('fs');
var path = require('path');
var ip = require('ip');
var config = require('config');
var EventEmitter = require('events');
var Playbook = require('node-ansible').Playbook;
var Constants = require('./constants');

class Instance extends EventEmitter {
  constructor(benchmark, engine, config) {
    super();
    this.benchmark = benchmark;
    this.name = Instance.generateName();
    this.state = Constants.State.Created;
    this.engine = engine;
    this.config = config;
    this.results = [];
  }

  runPlaybook(action, success, fail) {
    var playbook = new Playbook().playbook(action).variables({
      benchmark_name: this.benchmark,
      instance_name: this.name,
      host_ip_address: config.get('server.ip')
    });

    playbook.on('stdout', data => {
      console.log(data.toString());
    });

    playbook.on('stderr', data => {
      console.log(data.toString());
    });

    playbook.exec().then(
      () => {
        success();
      },
      err => {
        fail(err);
      }
    );
  }

  create(success, fail) {
    this.changeState(Constants.State.Provisioning);
    this.runPlaybook(
      Constants.Action.Deploy,
      () => {
        this.getLog(
          () => {
            this.getResults(
              results => {
                this.results = results;
                this.changeState(Constants.State.Finished);
                this.emit('finished', results);
                this.destroy();
              },
              err => {
                this.destroy();
                fail(err);
              }
            );
          },
          err => {
            this.destroy();
            fail(err);
          }
        );
      },
      fail
    );
  }

  destroy(success, fail) {
    this.runPlaybook(
      Constants.Action.Destroy,
      () => {
        this.emit('destroyed');
        success();
      },
      fail
    );
  }

  getLog(success, fail) {
    this.runPlaybook(Constants.Action.GetLog, success, fail);
  }

  changeState(state) {
    this.state = state;
    this.emit('changeState', state);
  }

  getResults(success, fail) {
    fs.readFile(
      path.join(__dirname, 'logs/' + this.benchmark + '/' + this.name + '.log'),
      (err, data) => {
        if (err) {
          return fail(err);
        }

        var logEvents = data
          .toString()
          .split('\n')
          .filter(x => x);

        var results = [];

        logEvents.forEach(logEvent => {
          console.log(logEvent);
        });

        success(results);
      }
    );
  }

  static generateName() {
    return 'instance-' + Math.random().toString(36).substr(2, 10);
  }
}

module.exports = Instance;
