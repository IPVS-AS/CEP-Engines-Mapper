var rimraf = require('rimraf');
var Vagrant = require('./vagrant');

var machine = new Vagrant('./esperimage/');

machine.up((err) => {
  if (err) {
    console.log(err);
  }
});

process.stdin.resume();

function cleanup() {
  console.log('Cleaning up before exit...');

  machine.killChildProcess();
  machine.destroy((err) => {
    if (err) {
      console.log(err);
    }

    rimraf(machine.machineFolder, (err) => {
      if (err) {
        console.log(err);
      }

      console.log('Clean up successful!');
      process.exit();
    });
  });
}

process.on('SIGINT', cleanup);
process.on('uncaughtException', cleanup);
