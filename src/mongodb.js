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

  static findBenchmarks(callback) {
    MongoDB.connect((err, client, db) => {
      if (err) {
        console.log(err);
        return callback([]);
      }

      db.collection('benchmarks').find().toArray((err, docs) => {
        if (err) {
          console.log(err);
          return callback([]);
        }

        client.close();

        return callback(docs);
      });
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
      if (err) {
        console.log(err);
      }

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
      if (err) {
        console.log(err);
      }

      // prettier-ignore
      db.collection('benchmarks').update(
        {
          $and: [{ name: benchmark }, { 'instances.name': instance }]
        },
        {
          $push: { 'instances.$.events': { $each: events } }
        },
        (err, r) => {
          if (err) {
            console.log(err);
          }

          client.close();
        }
      );
    });
  }

  static updateState(benchmark, instance, state) {
    MongoDB.connect((err, client, db) => {
      if (err) {
        console.log(err);
      }

      // prettier-ignore
      db.collection('benchmarks').update(
        {
          $and: [{ name: benchmark }, { 'instances.name': instance }]
        },
        {
          $set: { 'instances.$.state': state }
        },
        (err, r) => {
          if (err) {
            console.log(err);
          }

          client.close();
        }
      );
    });
  }
}

module.exports = MongoDB;
