RaspberrySurveillance
======================

Surveillance system designed for Raspberry PI.

It is a web interface that can:
  * Show snapshot of camera
  * Setup motion triggering
  * Start and stop motion triggering
  * Save captured videos to disk
  * Save captured videos to Webdav

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

    sudo pacman -S extra/php-apc
    sudo pacman -S core/curl
    sudo pacman -S bc
    sudo pacman -S imagemagick

### PHP.ini ###
There are some extensions needed.

    extension="apc.so"
    extension="sysvsem.so"

### Permission ###

    echo 'SUBSYSTEM=="vchiq",GROUP="video",MODE="0660"' > /etc/udev/rules.d/10-vchiq-permissions.rules
    usermod -a -G video [your_username]    
    chmod a+rw web/api/motion.json
    chmod a+rw script/monitor.sh
    touch web/api/monitor.log
    chmod a+rw web/api/monitor.log
