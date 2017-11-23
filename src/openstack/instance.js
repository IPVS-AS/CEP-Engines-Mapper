var fs = require('fs');
var path = require('path');
var ip = require('ip');
var EventEmitter = require('events');
var Playbook = require('node-ansible').Playbook;
var Constants = require('./constants');

class Instance extends EventEmitter {
  constructor(broker, endEventName, events, statements) {
    super();
    this.name = Instance.generateName();
    this.state = Constants.State.Created;
    this.broker = broker;
    this.endEventName = endEventName;
    this.events = events;
    this.statements = statements;
    this.results = [];
  }

  runPlaybook(action, success, fail) {
    var playbook = new Playbook().playbook(action).variables({
      instance_name: this.name,
      host_ip_address: ip.address()
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
      path.join(__dirname, 'logs/' + this.name + '.log'),
      (err, data) => {
        if (err) {
          return fail(err);
        }

        var logEvents = data
          .toString()
          .split('\n')
          .filter(x => x)
          .map(JSON.parse);

        var results = [];

        logEvents.forEach(logEvent => {
          var message = JSON.parse(logEvent.message);
          results.push({
            timestamp: logEvent.timestamp,
            statement: message.statement,
            events: message.event
          });
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
