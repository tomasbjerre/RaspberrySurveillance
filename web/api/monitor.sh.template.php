#!/bin/bash
<?php
$compare_picture_width = 640;
$compare_picture_height = $data['height']/$data['width']*$compare_picture_width;
?>
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
  rm -rf $wd/*compare.jpg
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
   curl -T "$1" "<?=$data['move_webdav_url']?>" --http1.0
   rm -rf $1
}

function remove_old_images {
 for file in `ls $wd/*image.jpg 2> /dev/null | sort | head -n -$1`; do
  #echo "rm $file"
  rm $file
 done
 for file in `ls $wd/*compare.jpg 2> /dev/null | sort | head -n -2`; do
  #echo "rm $file"
  rm $file
 done
 rm $wd/*diff.jpg
}

function to_percent {
 percent="$( echo "($1 / ($compare_width * $compare_height) * 100)" | bc -l )";
 percent=`printf "%.0f" $percent`;
}

#filename width height rot
function take_picture {
 /opt/vc/bin/raspistill -t 0 -n -o $1 -w $2 -h $3 -rot $4 -ex $exposure
}

#time filename width height rot
function record_video {
 echo "Recording video $1s to $2 in $width x $height with rotation $5..."
 /opt/vc/bin/raspivid -n -t $1 -o $2  -w $3 -h $4 -rot $5 -ex $exposure
}

cameralock="/tmp/cameralock"
if ! mkdir $cameralock; then echo "Lock exists."; exit; fi
wd="<?=$data['target_dir']?>"

rot=<?php if (key_exists('rot',$data)) { print $data['rot']; } else { print "0"; } ?>

width=<?=$data['width']?>

height=<?=$data['height']?>

move_webdav=<?php if ($data['on_event_end_options'] == "move_webdav") { print "1"; } else { print "0"; } ?>

save_movie=<?php if (key_exists('save_movie',$data)) { print "1"; } else { print "0"; } ?>

max_movie_time=<?=$data['movie_time']?>000

save_picture=<?php if (key_exists('save_picture',$data)) { print "1"; } else { print "0"; } ?>

ignore_colors=<?php if (key_exists('ignore_colors',$data)) { print "1"; } else { print "0"; } ?>

num_pictures_before=<?=$data['num_pictures_before']?>

num_pictures_after=<?=$data['num_pictures_after']?>

picture_width=<?=$data['width']?>

picture_height=<?=$data['height']?>

compare_picture_width=<?=$compare_picture_width?>

compare_picture_height=<?=$compare_picture_height?>

<?php if (!empty($data['monitor_area'])) { ?>
monitor_area_w=<?=round(split("x",$data['monitor_area'])[0]*$compare_picture_width)?>

monitor_area_h=<?=round(split("\+",split("x",$data['monitor_area'])[1])[0]*$compare_picture_height)?>

monitor_area_x=<?=round(split("\+",split("x",$data['monitor_area'])[1])[1]*$compare_picture_width)?>

monitor_area_y=<?=round(split("\+",split("x",$data['monitor_area'])[1])[2]*$compare_picture_height)?>

monitor_area=$monitor_area_w"x"$monitor_area_h"+"$monitor_area_x"+"$monitor_area_y

compare_width=$monitor_area_w
compare_height=$monitor_area_h
<?php } else { ?>
monitor_area=""
compare_width=$compare_picture_width
compare_height=$compare_picture_height
<?php } ?>

threshold="$(echo "<?=$data['threshold_percent']?>*0.01*$compare_width*$compare_height" | bc -l)"
threshold=`printf "%.0f" $threshold`

threshold_max="$(echo "<?=$data['threshold_percent_max']?>*0.01*$compare_width*$compare_height" | bc -l)"
threshold_max=`printf "%.0f" $threshold_max`

exposure=<?=$data['exposure']?>

if [ $monitor_area != "" ]; then
 echo "Triggering on area $monitor_area"
else
 echo "Triggering on threshold from $threshold to $threshold_max"
fi 

for (( event_num=0 ; ; )) do
 now=`date +"%Y-%m-%d_%H-%M-%S"`
 event=`printf %05d $event_num`
 current="$wd/$event-image.jpg"
 current_compare="$wd/$event-compare.jpg"
 previous="$wd/`printf %05d $(expr $event - 1)`-image.jpg"
 previous_compare="$wd/`printf %05d $(expr $event - 1)`-compare.jpg"
 diff_file="$wd/$event-image-diff.jpg"
 video="$wd/$event-$now-video.h264"

 take_picture $current $picture_width $picture_height $rot
 check_for_close

 main_color=`convert $current -colorspace rgb -scale 1x1 -format "%[pixel:p{0,0}]" info:`
 if [ $main_color = "rgb(0,0,0)" ]; then
  echo "Main color is $main_color, ignoring picture."
  continue
 #else
  #echo "Main color was $main_color"
 fi

 convert $current -resize <?=$compare_picture_width?>x<?=$compare_picture_height?> $current_compare
 if [ $monitor_area != "" ]; then
  convert $current_compare -crop $monitor_area $current_compare
 fi
 if [ $ignore_colors = "1" ]; then
  convert $current_compare -colorspace Gray $current_compare
 fi
 convert $current_compare -auto-level $current_compare

 if [ -e $previous ]; then
  compare_out="/tmp/compareout"
  compare -metric AE -fuzz 5% $current_compare $previous_compare $diff_file 2> $compare_out
  diff=`cat $compare_out`

  check_for_close

  to_percent $diff
  if [ `echo "$diff>$threshold" | bc -l` -eq "1" ]; then
   if [ `echo "$diff<$threshold_max" | bc -l` -eq "1" ]; then
    echo "Triggered on $diff ($percent%)"
    if [ $save_movie = "1" ]; then
     record_video $max_movie_time $video $width $height $rot
    else
     for (( i=0; i<$num_pictures_after; i++ )); do
       picture_after="$wd/$event-$i-image.jpg";
       take_picture $picture_after $picture_width $picture_height $rot;
     done
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

 remove_old_images $num_pictures_before
 check_for_close
 event_num=$[event_num+1]
done;


