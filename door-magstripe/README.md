door-magstripe
--------------

# Reading from the USB magstripe reader
This project uses a Magtek USB card reader, `lsusb` reports it as `Bus 004 Device 015: ID 0801:0001 MagTek Mini Swipe Reader (Keyboard Emulation)`. If you have a different one, use lsusb to find out these values, and put them in the config.json file. `lsusb` reports them in hex, so prepend `0x` to them.

# Converting USB HID to ASCII
The magtek documentation is located here: [http://www.magtek.com/docs/99875206.pdf](http://www.magtek.com/docs/99875206.pdf). Another implementation of this code written by jness on github is located here: [https://github.com/jness/magtek_cardreader/blob/master/main.py](https://github.com/jness/magtek_cardreader/blob/master/main.py).

I used that implementation to inform this new implementation. I found that the `while True:` polling loop that is uses is too taxing on the CPU to use on a Raspberry Pi, after many hours it tends to crash. `node-hid`'s callback structure is a lot less so.

# Hashing the card input
Since there is no other data used other than a card swipe, there is no way to use a salted hash. Therefore, the cards are hashed using sha512 with no salt. This will be changed to scrypt in the future.
