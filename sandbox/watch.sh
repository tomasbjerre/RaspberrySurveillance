#!/bin/bash

state="run"

function handle_exit {
 echo "Exiting..."
 state="close"
}
trap handle_exit SIGHUP SIGINT SIGTERM

cameralock="/tmp/thelock"
mkdir $cameralock

for (( event=0 ; ; event++ ))
do
 #echo "Test $event"
 wd="/srv/http/bjerre"
 current="$wd/$event-image.jpg"
 previous="$wd/$(expr $event - 1)-image.jpg"
 diff_file="$wd/$event-$(expr $event - 1)-diff-image.jpg"
 video="$wd/$event-video.h264"
 compare_out="/tmp/compareout"
 #echo "Current $current"
 #echo "Previous $previous"

 /opt/vc/bin/raspistill -t 0 -n -o $current -w 640 -h 480 --colfx 128:128 -rot 90

 convert $current -auto-level $current

 if [ -e $previous ];
 then
  compare -metric AE -fuzz 10% $current $previous $diff_file 2> $compare_out
  diff=`cat $compare_out`
  #echo "$previous $current $diff"
  
  if [ $diff > 10000 ];
  then
   echo "Change: $diff, recording $video"
   /opt/vc/bin/raspivid -w 640 -h 480 -n -t 20000 -o $video -rot 90
   echo "Sending {$current, $previous, $diff_file, $video}"   
   curl -T "{$current,$previous,$diff_file,$video}" "http://tomas:ab12cdab12cd@localhost/owncloud/files/webdav.php/motion/" --http1.0
   rm -f $wd/*;
  else
   echo "No change"
  fi
 fi

 if [ $state = "close" ];
 then
  echo "Clearing $wd in 5 seconds"
  rm -rf $wd/*
  rm -rf $cameralock
  exit
 fi 

 #echo "Sleep"
 #sleep 1
done;
