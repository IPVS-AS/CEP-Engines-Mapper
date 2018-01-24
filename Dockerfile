FROM ubuntu:16.04
WORKDIR /benchmarking

RUN apt-get update && apt-get install -y default-jre default-jdk maven

COPY ./src/benchmarking/pom.xml /benchmarking
RUN mvn dependency:resolve-plugins dependency:resolve clean compile

COPY ./src/benchmarking /benchmarking
RUN mvn clean compile
