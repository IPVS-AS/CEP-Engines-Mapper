#!/bin/bash -e

cd /vagrant
mvn package
java -cp target/CEP_Benchmarking-0.1.0.jar com.ipvs.cepbenchmarking.App &
