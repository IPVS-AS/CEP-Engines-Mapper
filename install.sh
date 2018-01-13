#!/bin/bash -e

# install ansible
sudo apt-get update
sudo apt-get install -y software-properties-common build-essential libssl-dev libffi-dev python-dev
sudo apt-add-repository -y ppa:ansible/ansible
sudo apt-get update
sudo apt-get install -y ansible

wget https://bootstrap.pypa.io/get-pip.py
sudo python get-pip.py
yes | sudo pip install shade

# install mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start

# install node
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install node
npm install

# create config file
cp config/default.json.example config/default.json
