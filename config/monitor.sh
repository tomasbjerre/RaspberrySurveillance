#!/bin/bash

state="run"

function handle_exit {
 echo "Exiting..."
 state="close"
}
trap handle_exit SIGHUP SIGINT SIGTERM

function clean_wd {
  if [ $save_picture = "0" ];
  then
   rm -rf $wd/*.jpg
   rm -rf $wd/*.h264
  fi
}

function send_file {
   echo "Sending $1"
   curl -T "$1" "http://tomas:ab12cdab12cd@localhost/owncloud/files/webdav.php/motion/" --http1.0
   rm -rf $1
}

function remove_old_images {
 for file in `ls $wd/*image.jpg 2> /dev/null | sort | head -n -$1`;
 do
  echo "rm $file"
  rm $file
 done
}

cameralock="/tmp/cameralock"
if ! mkdir $cameralock; then echo "Lock exists."; exit; fi
wd="/tmp"

threshold=3072
rot=0
width=640
height=480
move_to_webdav=1
save_movie=1
max_movie_time=10
save_picture=1
for (( event_num=0 ; ; event_num++ ))
do
 now=`date +"%Y-%m-%d_%H-%M-%S"`
 event=`printf %05d $event_num`
 current="$wd/$event-image.jpg"
 previous="$wd/`printf %05d $(expr $event - 1)`-image.jpg"
 diff_file="$wd/$event-image-diff.jpg"
 video="$wd/$event-$now-video.h264"

 /opt/vc/bin/raspistill -t 0 -n -o $current -w $width -h $height --colfx 128:128 -rot $rot
 convert $current -auto-level $current

 if [ -e $previous ];
 then
  compare_out="/tmp/compareout"
  compare -metric AE -fuzz 20% $current $previous $diff_file 2> $compare_out
  diff=`cat $compare_out`

  #If motion
  if [ $diff -gt $threshold ];
  then
   echo "Triggered on $diff"
   if [ $save_movie = "1" ];
   then
    /opt/vc/bin/raspivid -n -t $max_movice_time -o $video  -w $width -h $height -rot $rot
   fi

   if [ $move_webdav = "1" ];
   then
    send_file $video
    send_file $diff_file
    for file in `ls $wd/*image.jpg 2> /dev/null | sort -r | head -n 5`;
    do
     send_file $file
    done
    clean_wd
   fi

  else
   echo "$event Ignoring diff $diff"
  fi
 fi

 remove_old_images 10

 if [ $state = "close" ];
 then
  clean_wd
  rm -rf $cameralock
  exit
 fi
done;


