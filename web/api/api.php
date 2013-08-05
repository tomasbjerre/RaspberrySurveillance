<?php 
include("utils.php");

$CAM_CACHE = 'rpi_cam_image';
$CAM_CACHE_TTL = 1; //Seconds

if (isset($_GET["how"])) {
 $how = [
  "ex" => ["auto","night","nightpreview","backlight",
           "spotlight","sports","snow","beach","verylong",
           "fixedfps","antishake","fireworks","off"],
  "awb" => ["auto","sun","cloud","shade","tungsten",
            "fluorescent","incandescent","flash","horizon","off"],
  "ifx" => ["none","negative","solarise","sketch","denoise",
               "emboss","oilpaint","hatch","gpen","pastel",
               "watercolour","film","blur","saturation",
               "colourswap","washedout","posterise","colourpoint",
               "colourbalance","cartoon"],
  "mm" => ["average","spot","backlit","matrix"],
  "rot" => ["0","90","180","270"],
  "w" => ["640","1280","2592"],
  "h" => ["480","960","1936"],
  "q" => ["100", "90", "80", "70", "60", "50"]
 ];

 json_response($how);
}

if ($_GET["operation"] == "cameras") {
 $cameras = [["ip" => "127.0.0.1"]];
 json_response($cameras);
}

if ($_GET["operation"] == "camera") {
 if (isset($_GET["snapshot"])) {
  $sem = getCameraSem();
  if (isCameraUsedBySystem())
    image_response("Not available!");
  acquireCamera($sem);
  $image = apc_fetch($CAM_CACHE);
  if (!$image) {
   $params = " ".getParam("ex","");
   $params = $params." ".getParam("awb","");
   $params = $params." ".getParam("ifx","");
   $params = $params." ".getParam("mm","");
   $params = $params." ".getParam("rot","");
   $params = $params." -w ".$_GET['width'];
   $params = $params." -h ".$_GET['height'];
   $params = $params." ".getParam("q","");
   $command = escapeshellcmd("/opt/vc/bin/raspistill -t 0 -n ".$params." -o -");
   //print $command;
   ob_start();
   system($command);
   $image = ob_get_clean();
   apc_store($CAM_CACHE, $image, $CAM_CACHE_TTL);
  }
  releaseCamera($sem);
  header('Content-Type: image/jpeg');
  print $image;
  exit(0);
 }
}

if ($_GET["operation"] == "motion") {
 if ($_GET["action"] == "store") {
  $jsonOptions = json_encode($_POST,JSON_PRETTY_PRINT);
  file_put_contents(dirname(__FILE__)."/motion.json",$jsonOptions);
  renderAndStore("monitor.sh.template.php",$_POST,getRoot()."/script/monitor.sh");
  json_response($jsonOptions);
 }

 if ($_GET["action"] == "get") {
  $jsonOptions = getMotionConfig();
  json_response($jsonOptions);
  exit(0);
 }

 if ($_GET["action"] == "start") {
  if (!isMotionRunning()) {
   system("echo '' > monitor.log");
   system(getRoot()."/script/monitor.sh > monitor.log &");
  }
  exit(0);
 }

 if ($_GET["action"] == "stop") {
  system("ps -ef | grep \"monitor.sh\" | awk '{print \$2}' | xargs kill");
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

  $motionRunning = isMotionRunning();
 
  ob_start();
  system("tail -n 10 monitor.log");
  $log = nl2br(ob_get_clean());

  $data = [
   "targetFree" => $targetFree,
   "motionRunning" => $motionRunning,
   "log" => $log,
   "temp" => $temp
  ];
  json_response($data);  
 }
}

header('HTTP/1.1 500 Internal Server Error');
print("Did not understand input parameters.<br/>");
print($_SERVER['QUERY_STRING']);
?>
