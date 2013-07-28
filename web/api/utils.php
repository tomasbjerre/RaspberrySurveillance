<?php
function json_response($data) {
 header('Content-Type: text/javascript; charset=utf8');
 print(json_encode($data,JSON_PRETTY_PRINT));
 exit(0);
}

function image_response($text) {
 $im = imagecreatetruecolor(300, 200);
 $red = imagecolorallocate($im, 0xFF, 0x00, 0x00);
 $black = imagecolorallocate($im, 0x00, 0x00, 0x00);
 imagefilledrectangle($im, 0, 0, 299, 99, $red);
 $font_file = './arial.ttf';
 imagefttext($im, 13, 0, 105, 55, $black, $font_file, $text);
 header('Content-Type: image/png');
 imagepng($im);
 imagedestroy($im); 
 exit(0);
}

function getParam($param, $or) {
 if (isset($_GET[$param]))
  return "-".$param." ".$_GET[$param];
 return $or;
}

function getCameraSem() {
 return sem_get(8484839393948);
}

function isCameraUsedBySystem() {
 if (is_dir("/tmp/cameralock"))
   return false;
 return true;
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
 file_put_contents($file,$rendered);
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
?>
