#!/bin/bash
CRONTAB=@reboot bash /opt/magstripe/scripts/start.sh
###############################################################################

# Make sure only root can run our script
if [ "$(id -u)" != "0" ]; then
  echo "This script must be run as root!" 1>&2
  exit 1
fi

echo 'Installing python dependancies'
pip2 install -r deps.txt

echo 'Creating install directory at /opt/magstripe'
mkdir /opt/magstripe

echo 'Moving files to directories'
mv * /opt/magstripe/

# Copy cron file to tmp, concat new crontab, then put tmp back
echo 'Installing Crontab:'
crontab -l > tmp
echo ${CRONTAB}  # to stdout
echo ${CRONTAB} >> tmp
crontab tmp

echo 'Starting the card check script'
bash /opt/magstripe/scripts/start.sh
