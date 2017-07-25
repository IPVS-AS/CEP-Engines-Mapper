#!/bin/bash -e

cd /vagrant
mvn clean package
mvn exec:java
