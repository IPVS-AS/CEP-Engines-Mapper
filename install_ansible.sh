#!/bin/bash -e

# install ansible
apt-get update
apt-get install software-properties-common build-essential libssl-dev libffi-dev python-dev
apt-add-repository ppa:ansible/ansible
apt-get update
apt-get install ansible

wget https://bootstrap.pypa.io/get-pip.py
python get-pip.py
pip install shade
