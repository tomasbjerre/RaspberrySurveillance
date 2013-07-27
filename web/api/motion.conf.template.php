<?php
 ob_start();
 ?>
 while ! mkdir <?=$data['target_dir']?>/motionlock; do sleep 5; done; all=""; for i in <?=$data['target_dir']?>/*%v.*; do all=$all,$i; done; all={${all:1}}; echo $all; curl -T "$all" "http://tomas:ab12cdab12cd@localhost/owncloud/files/webdav.php/motion/" --http1.0 && rm -f <?=$data['target_dir']?>/*%v.*; rm -rf <?=$data['target_dir']?>/motionlock;
 <?php
 $waitAndSend = ob_get_clean();
?>
daemon on
process_id_file /tmp/motion.pid 

framerate 1
minimum_frame_time 1
#max 2592x1936
#half max: 1280x960
#half half max: 640x480
width <?=$data['width']?>

height <?=$data['height']?>

netcam_url <?=$data['netcam_url']?>

netcam_http 1.0
auto_brightness on

threshold <?=round($data['threshold_percent']*0.01*$data['width']*$data['height'])?>

noise_tune on
minimum_motion_frames 1
gap 0
quality 100

target_dir <?=$data['target_dir']?>


<?php if (key_exists('save_movie',$data)) { ?>
<?php if (key_exists('save_picture',$data)) { ?>
pre_capture 0
post_capture 0
max_mpeg_time <?=$data['max_mpeg_time']?>

ffmpeg_cap_new on
ffmpeg_bps 400000
ffmpeg_video_codec mpeg4
text_right %Y-%m-%d\n%T-%q
text_changes on
movie_filename %Y-%m-%d_%H_%M_%S-%v
<?php } else { ?>
on_event_start mkdir /tmp/thelock; sleep 1; /opt/vc/bin/raspivid -n -t <?=$data['max_mpeg_time']?>000 -o /tmp/%Y-%m-%d_%H_%M_%S-%v.h264 -rot 180 ; rm -rf /tmp/thelock; <?=$waitAndSend?>
<?php } ?>
<?php } ?>


<?php if (key_exists('save_picture',$data)) { ?>
output_all off
output_normal on
jpeg_filename %Y-%m-%d_%H_%M_%S-%v
<?php } ?>


<?php if ($data['on_event_end_options'] == "move_webdav") { ?>
on_event_end <?=$waitAndSend?>
<?php } ?>

