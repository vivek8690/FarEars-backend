#!/bin/bash

# install fail2ban on host OS(ubuntu)
sudo apt update
sudo apt install fail2ban
echo -e  "[asterisk]\n\
enabled = true\n\
filter = asterisk\n\
action = iptables-allports[name=ASTERISK, protocol=all]\n\
logpath = /var/log/asterisk/messages\n\
          /var/log/asterisk/security\n\
maxretry = 5\n\
findtime = 21600\n\
bantime = 86400" > /etc/fail2ban/jail.local
sudo systemctl restart fail2ban