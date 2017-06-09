#!/bin/bash -e

cd /vagrant
mvn package
mvn exec:java
