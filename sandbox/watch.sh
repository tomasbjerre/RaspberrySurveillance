#!/bin/bash

state="run"

function handle_exit {
 echo "Exiting..."
 state="close"
}
trap handle_exit SIGHUP SIGINT SIGTERM

function clean_wd {
  rm -rf $wd/*.jpg
  rm -rf $wd/*.h264
}

function send_file {
   echo "Sending $1"
   curl -T "$1" "http://tomas:ab12cdab12cd@localhost/owncloud/files/webdav.php/motion/" --http1.0
   rm -rf $1
}

wd="/tmp"
cameralock="/tmp/thelock"
if ! mkdir $cameralock; then echo "Lock exists."; exit; fi

for (( event_num=0 ; ; event_num++ ))
do
 now=$e`date +"%Y-%m-%d_%H-%M-%S"`
 event=`printf %05d $event_num`
 current="$wd/$event-image.jpg"
 previous="$wd/`printf %05d $(expr $event - 1)`-image.jpg"
 diff_file="$wd/$event-image-diff.jpg"
 video="$wd/$event-$now-video.h264"
 compare_out="/tmp/compareout"

 /opt/vc/bin/raspistill -t 0 -n -o $current -w 640 -h 480 --colfx 128:128 -rot 90
 convert $current -auto-level $current

 if [ -e $previous ];
 then
  compare -metric AE -fuzz 20% $current $previous $diff_file 2> $compare_out
  diff=`cat $compare_out`
  
  if [ $diff -gt 5000 ];
  then
   echo "Change: $diff, recording $video"
   /opt/vc/bin/raspivid -w 640 -h 480 -n -t 20000 -o $video -rot 90
   for file in `ls /tmp/*image.jpg 2> /dev/null | sort -r | head -n 5`;
   do
    send_file $file
   done
   send_file $diff_file
   send_file $video
   clean_wd
  else
   echo "$event Ignoring diff $diff"
  fi
 fi

 #Remove images, keep the last 10
 for file in `ls /tmp/*image.jpg 2> /dev/null | sort | head -n -10`;
 do
  echo "rm $file"
  rm $file
 done

 if [ $state = "close" ];
 then
  clean_wd
  rm -rf $cameralock
  exit
 fi 
done;
