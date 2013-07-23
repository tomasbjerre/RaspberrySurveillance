<?php
function json_response($data) {
 header('Content-Type: text/javascript; charset=utf8');
 print(json_encode($data,JSON_PRETTY_PRINT));
 exit(0);
}

function getParam($param, $or) {
 if (isset($_GET[$param]))
  return "-".$param." ".$_GET[$param];
 return $or;
}
?>
