# Raspberry Pi powered door opener
#### Using a USB HID magstripe reader for authentication


Code for converting USB HID codes, capturing control of the magstripe reader, etc is used from [jness](https://github.com/jness/magtek_cardreader/blob/master/main.py). 

I added some code to load the HID codes from json files, and for validating cards in [checkCard.py](https://github.com/rhinoceraptor/RPiMagstripe/blob/master/scripts/checkCard.py), and for storing card hashes in [programCard.py](https://github.com/rhinoceraptor/RPiMagstripe/blob/master/scripts/programCard.py).

This repo also contains scripts for installing to /opt/magstripe on the Raspberry Pi, installing python dependancies, and for installing a crontab so [checkCard.py](https://github.com/rhinoceraptor/RPiMagstripe/blob/master/scripts/checkCard.py) will run at boot.
