<?php 
include("utils.php");

$CAM_CACHE = 'rpi_cam_image';
$CAM_CACHE_TTL = 1; //Seconds

if ($_GET["operation"] == "camera") {
 if (isset($_GET["snapshot"])) {
  $sem = getCameraSem();
  if (isCameraUsedBySystem())
    imageResponse(file_get_contents(getLatestRecording()));
  acquireCamera($sem);
  $image = apc_fetch($CAM_CACHE);
  if (!$image) {
   $params = $params." -ifx ".$_GET['effect'];
   $params = $params." -ex ".$_GET['exposure'];
   $params = $params." -rot ".$_GET['rot'];
   $params = $params." -w ".$_GET['width'];
   $params = $params." -h ".$_GET['height'];
   $command = escapeshellcmd("/opt/vc/bin/raspistill -t 1 -n ".$params." -e png -o -");
   //print $command;
   ob_start();
   system($command);
   $image = ob_get_clean();
   apc_store($CAM_CACHE, $image, $CAM_CACHE_TTL);
  }
  releaseCamera($sem);
  imageResponse($image);
  exit(0);
 }
}

if ($_GET["operation"] == "motion") {
 if ($_GET["action"] == "store") {
  $jsonOptions = json_encode($_POST,JSON_PRETTY_PRINT);
  file_put_contents(dirname(__FILE__)."/motion.json",$jsonOptions);
  renderAndStore("monitor.sh.template.php",$_POST,getRoot()."/script/monitor.sh");
  jsonResponse($jsonOptions);
 }

 if ($_GET["action"] == "get") {
  $jsonOptions = getMotionConfig();
  jsonResponse($jsonOptions);
  exit(0);
 }

 if ($_GET["action"] == "start") {
  if (!isMonitorRunning()) {
   $log = getRoot()."/web/api/monitor.log";
   $command = getRoot()."/script/monitor.sh > ".$log;
   //print($command);
   system("echo '' > ".$log);
   system($command." &");
  }
  exit(0);
 }

 if ($_GET["action"] == "stop") {
  monitor_stop();
  exit(0);
 }
}

if ($_GET["operation"] == "status") {
 if ($_GET["action"] == "all") {
  $motionConfig = json_decode(getMotionConfig(), true);
  $targetFree = (round((disk_free_space($motionConfig["target_dir"])/1024/1024/1024),2)."gb");

  ob_start();
  system('/opt/vc/bin/vcgencmd measure_temp');
  $temp = split("=",ob_get_clean())[1];

  $motionRunning = isMonitorRunning();
 
  ob_start();
  system("tail -n 10 monitor.log");
  $log = nl2br(ob_get_clean());

  $data = [
   "targetFree" => $targetFree,
   "motionRunning" => $motionRunning,
   "log" => $log,
   "temp" => $temp
  ];
  jsonResponse($data);  
 }
}

header('HTTP/1.1 500 Internal Server Error');
print("Did not understand input parameters.<br/>");
print($_SERVER['QUERY_STRING']);
?>
