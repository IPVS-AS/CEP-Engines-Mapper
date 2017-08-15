Vagrant.configure("2") do |config|
  config.ssh.username = "ubuntu"

  config.vm.provision :shell, path: "install_vagrant.sh"
  config.vm.provision :shell, path: "install_node.sh", privileged: false

  config.vm.provider :openstack do |os|
      os.openstack_auth_url = "http://129.69.209.131:5000/v2.0/tokens"
      os.username = "nahralo"
      os.password = "84237610"
      os.tenant_name = "IoTMonitoring"

      os.server_name = "develop"
      os.flavor = "m1.medium"
      os.image = "ubuntu-16.04-server-cloudimg-amd64"
      os.floating_ip = "192.168.209.186"
      os.security_groups = ["default"]
  end
end
