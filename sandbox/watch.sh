#!/bin/bash

state="run"

function handle_exit {
 echo "Exiting..."
 state="close"
}
trap handle_exit SIGHUP SIGINT SIGTERM

for (( event=0 ; ; event++ ))
do
 #echo "Test $event"
 wd="/srv/http/bjerre"
 current="$wd/image-$event.jpg"
 previous="$wd/image-$(expr $event - 1).jpg"
 diff_file="$wd/image-$event-$(expr $event - 1)-diff.jpg"
 compare_out="/tmp/compareout"
 #echo "Current $current"
 #echo "Previous $previous"

 /opt/vc/bin/raspistill -t 0 -n -o $current -w 640 -h 480 --colfx 128:128 -rot 90

 convert $current -auto-level $current

 if [ -e $previous ];
 then
  compare -metric AE -fuzz 10% $current $previous $diff_file 2> $compare_out
  diff=`cat $compare_out`
  echo "$previous $current $diff"
 fi

 if [ $state = "close" ];
 then
  echo "Clearing $wd in 5 seconds"
  rm -rf $wd/*
  exit
 fi 

 #echo "Sleep"
 #sleep 1
done;
