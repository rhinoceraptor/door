#! /bin/bash

gcc -o open c/door.c -std=c99 -lwiringPi
chown root open
chmod u+s open

gcc -o off c/off.c -std=c99 -lwiringPi
chown root off
chmod u+s off

