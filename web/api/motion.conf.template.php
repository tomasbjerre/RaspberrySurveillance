daemon on
process_id_file /tmp/motion.pid 
width <?=$data['width']?>

height <?=$data['height']?>

framerate 2
minimum_frame_time 1
netcam_url <?=$data['netcam_url']?>

netcam_http 1.0
auto_brightness on

threshold <?=$data['threshold']?>

noise_tune on
minimum_motion_frames 2
pre_capture 5
post_capture 5
gap 5
max_mpeg_time <?=$data['max_mpeg_time']?>

output_all off
quality 75

ffmpeg_cap_new on
ffmpeg_bps 400000
ffmpeg_video_codec mpeg4

text_right %Y-%m-%d\n%T-%q
text_changes on

target_dir <?=$data['target_dir']?>

output_normal off
movie_filename %Y-%m-%d_%H_%M_%S-%v

<?php if ($data['on_movie_end_options'] == "move_webdav") { ?>
on_movie_end /home/bjerre/sites/RaspberrySurveillance/sandbox/webdavmove.sh -u "<?=$data['webdavUrl']?>" -d motion <?=$data['target_dir']?>/*%v.avi; rm -f <?=$data['target_dir']?>/*%v.*; 
<?php } ?>
