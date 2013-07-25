RaspberrySurveillance
======================

Surveillance system designed for Raspberry PI.

## Camera ##
This is the hardware used to build the camera:
* Raspberry Pi Model B 512MB RAM
* Camera Module for Raspberry Pi
* WiFi USB Nano
* OpenBox Sky Case
* 16GB SD

Cost (approximately): 900 SEK / $135 / 100 £

## Install ##
These instructions are a work in progress!

I have developed this on ArchLinux. I'll be writing instructions as if you are using ArchLinux and you'll have to translate it to your distribution.

### Required packages ###
 sudo pacman -S install extra/php-apc
 sudo pacman -S install extra/emotion
 sudo pacman -S install core/curl

### PHP.ini ###
There are some extensions needed.
 extension="apc.so"
 extension="sysvsem.so"


