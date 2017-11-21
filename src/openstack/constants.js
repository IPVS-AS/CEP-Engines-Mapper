exports.State = {
  Created: 'Created',
  Provisioning: 'Provisioning',
  Benchmarking: 'Benchmarking',
  Finished: 'Finished'
};

exports.Action = {
  Deploy: __dirname + '/deploy',
  Destroy: __dirname + '/destroy',
  GetLog: __dirname + '/getlog'
};

