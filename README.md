# Raspberry Pi powered door opener
#### Using a USB HID magstripe reader for authentication


Code for converting USB HID codes, capturing control of the magstripe reader, etc is used from [jness](https://github.com/jness/magtek_cardreader/blob/master/main.py). 

I added some code to load the HID codes from json files, and for validating cards in [checkCard.py](https://github.com/rhinoceraptor/RPiMagstripe/blob/master/scripts/checkCard.py), and for storing card hashes in [programCard.py](https://github.com/rhinoceraptor/RPiMagstripe/blob/master/scripts/programCard.py).

This repo also contains scripts for installing to /opt/magstripe on the Raspberry Pi, installing python dependancies, and for installing a crontab so [checkCard.py](https://github.com/rhinoceraptor/RPiMagstripe/blob/master/scripts/checkCard.py) will run at boot.

## Hardware

* [Raspberry pi](http://www.amazon.com/RASPBERRY-MODEL-756-8308-Raspberry-Pi/dp/B009SQQF9C/) (I am using arch linux ARM on mine)
* [Common servo](http://www.radioshack.com/product/index.jsp?productId=22472146) (needs to be able to sweep about 170 degrees, and fit a wheel)
* [Servo wheel](http://www.adafruit.com/products/167), cut a groove in it with a lathe that thread will lie in. Then drill a hole on its surface to put the thread through.
* [Door handle](http://www.amazon.com/Duro-Med-Door-Knob-Extender-Package/dp/B000PGRKZW/), connect the thread through the handle so that when the servo turns, the know is pulled down.
* Green and red led with a common ground for indicator light.
* [Female to male jumpers](http://www.amazon.com/Phantom-YoYo-dupont-cable-female/dp/B00A6SOGC4/) for wiring everything up.
* Two 5v power supplies, one for the servo and one for the raspberry pi. I have them wired with DC jacks on the case.
* Project box to fit it all
* (optional) [Magnetic switches]((http://www.amazon.com/7939WG-WH-Honeywell-Surface-Mount-Contacts/dp/B001DEUUZC/)) to tell if the door is open. They are used so that an irc bot can tell the state of the door. They are wired to 1/8" mono audio jacks on the case.
