<?php
if (isset($_GET["messageType"])) {
	$messageType=$_GET["messageType"];
} else {
	$messageType=$_POST["messageType"];
}

if ($messageType != "offer" && $messageType != "answer" && $messageType != "iceServer" && $messageType != "iceClient") {
	echo $messageType;
	die("operation not permited");
}

if ($_SERVER['REQUEST_METHOD'] == "POST") {
	$msg=$_POST[$messageType];
	$id=$_POST[$messageType."Id"];
	$file=fopen(sys_get_temp_dir().'/room.'.$messageType.$id, "w");
	$count=fwrite($file, $msg);	
	fclose($file);
}

if ($_SERVER['REQUEST_METHOD'] == "GET") {
	$id=$_GET[$messageType."Id"];
	$fileName=sys_get_temp_dir().'/room.'.$messageType.$id;
	$i=0;
	while (!file_exists($fileName)) {
		usleep(500000);
		$i++;
		if ($i > 120) {
			die('timeout');
		}
	}
	$file=fopen($fileName, 'r');
	echo fread($file, 8192);
	fclose($file);
	unlink($fileName);
}
?>
