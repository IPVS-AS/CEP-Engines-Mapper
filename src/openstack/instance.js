var ip = require('ip');
var EventEmitter = require('events');
var Playbook = require('node-ansible').Playbook;
var Constants = require('./constants');

class Instance extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.name = Instance.generateName();
    this.state = Constants.State.Created;
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
    console.log('create instance');
    this.runPlaybook(
      Constants.Action.Deploy,
      () => {
        this.getLog(
          () => {
            this.changeState(Constants.State.Finished);
            this.destroy();
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
    this.runPlaybook(Constants.Action.Destroy, success, fail);
  }

  getLog(success, fail) {
    this.runPlaybook(Constants.Action.GetLog, success, fail);
  }

  changeState(state) {
    this.state = state;
    this.emit('changeState', state);
  }

  static generateName() {
    return 'benchmark_' + Math.random().toString(36).substr(2, 10);
  }
}

module.exports = Instance;
