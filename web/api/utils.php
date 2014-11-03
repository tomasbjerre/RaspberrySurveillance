<?php
function monitor_stop() {
 system("ps -ef | grep \"monitor.sh\" | awk '{print \$2}' | xargs kill");
}

function getLatestRecording() {
 $config = json_decode(getMotionConfig(), true);
 $targetDir = $config["target_dir"];
 ob_start();
 system("ls -atR ".$targetDir."/*image.jpg | head -n 1");
 $filename = trim(ob_get_clean());
 //print "\"".$filename."\"";
 return $filename;
}

function jsonResponse($data) {
 header('Content-Type: text/javascript; charset=utf8');
 print(json_encode($data,JSON_PRETTY_PRINT));
 exit(0);
}

function imageResponse($image) {
 header('Content-Type: image/jpeg');
 print($image);
 exit(0);
}

function getCameraSem() {
 return sem_get(8484839393948);
}

function isCameraUsedBySystem() {
 if (is_dir("/tmp/cameralock"))
   return true;
 return false;
}

function acquireCamera($sem) {
 sem_acquire($sem);
}

function releaseCamera($sem) {
 sem_release($sem);
}

function renderAndStore($template, $data, $file) {
 ob_start();
 $data = $data;
 include($template);
 $rendered = ob_get_clean();
 file_put_contents($file,$rendered) or die("Unable to store $file");
}

function parseUrl($url) {
 $path = "";
 if (key_exists("path",parse_url($url))) {
  $path = parse_url($url)['path'];
 }
 $query = "";
 if (key_exists("query",parse_url($url))) {
  $query = parse_url($url)['query'];
 }
 $noUserPass = parse_url($url)['scheme']."://".parse_url($url)['host'].$path."?".$query;
 return [
  "url" => $noUserPass,
  "host" => parse_url($url, PHP_URL_HOST),
  "user" => parse_url($url, PHP_URL_USER),
  "pass" => parse_url($url, PHP_URL_PASS)
 ];
}

function getMotionConfig() {
 return file_get_contents(dirname(__FILE__)."/motion.json");
}

function getRoot() {
 return dirname(__FILE__)."/../..";
}

function getMonitorPid() {
 ob_start();
 system('pgrep monitor');
 $pid = ob_get_clean();
 //print "pid: $pid";
 return $pid;
}

function isMonitorRunning() {
 $pid = getMonitorPid();
 return $pid > 0;
}
?>
