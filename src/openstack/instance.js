var fs = require('fs');
var path = require('path');
var ip = require('ip');
var config = require('config');
var EventEmitter = require('events');
var Playbook = require('node-ansible').Playbook;
var Constants = require('./constants');
var MongoDB = require('../mongodb');

class Instance extends EventEmitter {
  constructor(benchmark, engine, config) {
    super();
    this.benchmark = benchmark;
    this.name = Instance.generateName();
    this.state = Constants.State.Created;
    this.engine = engine;
    this.config = config;
  }

  runPlaybook(action, success, fail) {
    var playbook = new Playbook().playbook(action).variables({
      auth_url: config.get('openstack.auth_url'),
      username: config.get('openstack.username'),
      password: config.get('openstack.password'),
      project_name: config.get('openstack.project_name'),
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
            this.getEvents(
              () => {
                this.destroy(success, fail);
              },
              err => {
                this.destroy(() => {
                  fail(err);
                }, fail);
              }
            );
          },
          err => {
            this.destroy(() => {
              fail(err);
            }, fail);
          }
        );
      },
      fail
    );
  }

  destroy(success, fail) {
    if (this.state == Constants.State.Finished) {
      return success();
    }

    this.runPlaybook(
      Constants.Action.Destroy,
      () => {
        this.changeState(Constants.State.Finished);
        success();
      },
      err => {
        this.changeState(Constants.State.Failed);
        fail(err);
      }
    );
  }

  getLog(success, fail) {
    this.runPlaybook(Constants.Action.GetLog, success, fail);
  }

  changeState(state) {
    this.state = state;
    MongoDB.updateState(this.benchmark, this.name, state);
    this.emit('changeState', state);
  }

  getEvents(success, fail) {
    var self = this;

    fs.readFile(
      path.join(__dirname, 'logs/' + this.benchmark + '/' + this.name + '.log'),
      (err, data) => {
        if (err) {
          return fail(err);
        }

        var events = data
          .toString()
          .split('\n')
          .filter(e => e)
          .map(JSON.parse)
          .map(e => {
            var msg = JSON.parse(e.message);
            return { name: msg.name, data: msg.data, timestamp: msg.timestamp };
          });

        MongoDB.insertEvents(self.benchmark, self.name, events);

        success();
      }
    );
  }

  static generateName() {
    return 'instance-' + Math.random().toString(36).substr(2, 10);
  }
}

module.exports = Instance;
