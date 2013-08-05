#!/bin/bash

state="run"

function handle_exit {
 echo "Exiting..."
 state="close"
}
trap handle_exit SIGHUP SIGINT SIGTERM

function check_for_close {
 if [ $state = "close" ]; then
  clean_wd
  rm -rf $cameralock
  echo "Exited"
  exit
 fi
}

function clean_wd {
  if [ $move_webdav = "1" ]; then
   rm -rf $wd/*.jpg
   rm -rf $wd/*.h264
  fi
  if [ $save_picture = "0" ]; then
   rm -rf $wd/*.jpg
  fi
  if [ $save_movie = "0" ]; then
   rm -rf $wd/*.h264
  fi
}

function send_file {
   echo "Sending $1"
   curl -T "$1" "http://tomas:ab12cdab12cd@localhost/owncloud/files/webdav.php/motion/" --http1.0
   rm -rf $1
}

function remove_old_images {
 for file in `ls $wd/*image.jpg 2> /dev/null | sort | head -n -$1`; do
  echo "rm $file"
  rm $file
 done
 rm $wd/*diff.jpg
}

function to_percent {
 percent="$( echo "($1 / ($width * $height) * 100)" | bc -l )";
 percent=`printf "%.0f" $percent`;
}

cameralock="/tmp/cameralock"
if ! mkdir $cameralock; then echo "Lock exists."; exit; fi
wd="/tmp"

rot=90
width=1280
height=720
move_webdav=1
save_movie=1
max_movie_time=10000

save_picture=1
picture_width=1280
picture_height=720
threshold="$(echo "10*0.01*$picture_width*$picture_height" | bc -l)"
threshold=`printf "%.0f" $threshold`

threshold_max="$(echo "99*0.01*$picture_width*$picture_height" | bc -l)"
threshold_max=`printf "%.0f" $threshold_max`

echo "Triggering on threshold from $threshold to $threshold_max"

for (( event_num=0 ; ; event_num++ )) do
 now=`date +"%Y-%m-%d_%H-%M-%S"`
 event=`printf %05d $event_num`
 current="$wd/$event-image.jpg"
 previous="$wd/`printf %05d $(expr $event - 1)`-image.jpg"
 diff_file="$wd/$event-image-diff.jpg"
 video="$wd/$event-$now-video.h264"

 /opt/vc/bin/raspistill -t 0 -n -o $current -w $picture_width -h $picture_height --colfx 128:128 -rot $rot
 check_for_close
 convert $current -auto-level $current

 if [ -e $previous ]; then
  compare_out="/tmp/compareout"
  compare -metric AE -fuzz 5% $current $previous $diff_file 2> $compare_out
  diff=`cat $compare_out`

  check_for_close

  #If motion
  to_percent $diff
  if [ `echo "$diff>$threshold" | bc -l` -eq "1" ]; then
   if [ `echo "$diff<$threshold_max" | bc -l` -eq "1" ]; then
    echo "Triggered on $diff ($percent%)"
    if [ $save_movie = "1" ]; then
     echo "/opt/vc/bin/raspivid -n -t $max_movie_time -o $video  -w $width -h $height -rot $rot"
     /opt/vc/bin/raspivid -n -t $max_movie_time -o $video  -w $width -h $height -rot $rot
    fi

    if [ $move_webdav = "1" ]; then
     if [ $save_movie = "1" ]; then
      send_file $video
     fi
     if [ $save_picture = "1" ]; then
      send_file $diff_file
      for file in `ls $wd/*image.jpg 2> /dev/null | sort -r | head -n 5`; do
       send_file $file
      done
     fi
     clean_wd
    fi
   else
    echo "$event Ignoring diff $diff ($percent%)"
   fi
  else
   echo "$event Ignoring diff $diff ($percent%)"
  fi
 fi

 remove_old_images 10
 check_for_close
done;


