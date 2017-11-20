#!/bin/bash -e

# install ansible
apt-get update
apt-get install -y software-properties-common build-essential libssl-dev libffi-dev python-dev
apt-add-repository -y ppa:ansible/ansible
apt-get update
apt-get install -y ansible

wget https://bootstrap.pypa.io/get-pip.py
python get-pip.py
yes | pip install shade
