# CEP Benchmarking

## Installation

Clone the repository:

```sh
git clone https://gitlab-as.informatik.uni-stuttgart.de/hirmerpl/CEP_Benchmarking.git
```

Run `install.sh` script:

```sh
cd CEP_Benchmarking/
./install.sh
```

Run `source` to update terminal:

```sh
source ~/.bashrc
```

## Configuration

After running the installation script `install.sh`, a new configuration file `default.json` will appear under `config/` folder:

```json
{
  "openstack": {
    "auth_url": "http://129.69.209.131:5000/v2.0",
    "username": "username",
    "password": "password",
    "project_name": "project"
  },
  "server": {
    "ip": "192.168.209.186",
    "wss_port": 8080
  },
  "app": {
    "port": 3000
  },
  "mongodb": "mongodb://localhost:27017",
  "temperature_samples": 50
}
```

- `openstack` configuration for authentication with the OpenStack cloud platform.
- `server` ip and port used by the benchmarking instances to communicate with the benchmarking server.
- `app.port` port used by the WebSocket server for front-end communication.
- `mongodb` address to the running mongodb database.
- `temperature_samples` number of random temperature samples to generate.

## Running

Make sure `mongod` is running:

```sh
sudo service mongod start
```

Start the application:

```sh
npm start
```
