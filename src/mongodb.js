var config = require('config');
var MongoClient = require('mongodb').MongoClient;

var url = config.get('mongodb');
var project = 'cepbenchmarking';

class MongoDB {
  static connect(callback) {
    MongoClient.connect(url, (err, client) => {
      if (err) {
        return callback(err);
      }

      var db = client.db(project);

      callback(null, client, db);
    });
  }

  static insertBenchmark(benchmark) {
    var instances = [];
    for (var name in benchmark.instances) {
      if (benchmark.instances.hasOwnProperty(name)) {
        var instance = benchmark.instances[name];

        instances.push({
          name: instance.name,
          state: instance.state,
          engine: instance.engine,
          config: instance.config,
          events: []
        });
      }
    }

    var document = {
      name: benchmark.name,
      broker: benchmark.broker,
      endEventName: benchmark.endEventName,
      instances: instances
    };

    MongoDB.connect((err, client, db) => {
      db.collection('benchmarks').insertOne(document, (err, r) => {
        if (err) {
          console.log(err);
        }

        client.close();
      });
    });
  }

  static insertEvents(benchmark, instance, events) {
    MongoDB.connect((err, client, db) => {
      db.collection('benchmarks').update(
        {
          $and: [{ name: benchmark }, { 'instances.name': instance }]
        },
        { $push: { 'instances.$.events': { $each: events } } }
      );

      client.close();
    });
  }
}

module.exports = MongoDB;
