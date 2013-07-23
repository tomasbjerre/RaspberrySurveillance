<?php 
include("utils.php");

if (isset($_GET["how"])) {
 $how = [
  "ex" => ["off","auto","night","nightpreview","backlight",
           "spotlight","sports","snow","beach","verylong",
           "fixedfps","antishake","fireworks"],
  "awb" => ["off","auto","sun","cloud","shade","tungsten",
            "fluorescent","incandescent","flash","horizon"],
  "ifx" => ["none","negative","solarise","sketch","denoise",
               "emboss","oilpaint","hatch","gpen","pastel",
               "watercolour","film","blur","saturation",
               "colourswap","washedout","posterise","colourpoint",
               "colourbalance","cartoon"],
  "mm" => ["average","spot","backlit","matrix"],
  "rot" => ["0","90","180","270"],
  "w" => ["2952", "1296"],
  "h" => ["1944", "512"],
  "q" => ["50", "60", "70", "80", "90", "100"]
 ];

 json_response($how);
}

if ($_GET["operation"] == "cameras") {
 $cameras = [["ip" => "127.0.0.1"]];
 json_response($cameras);
}

if ($_GET["operation"] == "camera") {
 if (isset($_GET["snapshot"])) {
  $params = " ".getParam("ex","");
  $params = $params." ".getParam("awb","");
  $params = $params." ".getParam("ifx","");
  $params = $params." ".getParam("mm","");
  $params = $params." ".getParam("rot","");
  $params = $params." ".getParam("w","");
  $params = $params." ".getParam("h","");
  $params = $params." ".getParam("q","");
  header('Content-Type: image/jpeg');
  $command = "/opt/vc/bin/raspistill -t 0 ".$params." -o -";
  //print $command;
  system($command);
  exit(0);
 }
}

print("Did not understand input parameters.<br/>");
print($_SERVER['QUERY_STRING']);
?>
