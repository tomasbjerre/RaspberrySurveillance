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
  "mm" => ["average","spot","backlit","matrix"]
 ];

 json_response($how);
}

if ($_GET["operation"] == "cameras") {
 $cameras = [["ip" => "127.0.0.1"]];
 json_response($cameras);
}

if ($_GET["operation"] == "camera") {
 if (isset($_GET["snapshot"])) {
  $params += " ".getOr("ex","");
  $params += " ".getOr("awb","");
  $params += " ".getOr("ifx","");
  $params += " ".getOr("mm","");
  header('Content-Type: image/jpeg');
  system("/opt/vc/bin/raspistill ".$params." -o -");
  exit(0);
 }
}

print("Did not understand input parameters.<br/>");
print($_SERVER['QUERY_STRING']);
?>
