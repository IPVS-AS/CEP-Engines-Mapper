#!/bin/bash -e

# install nvm and node
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install node
nvm use node


# change to /vagrant on ssh
echo "cd /vagrant" >> $HOME/.bashrc
