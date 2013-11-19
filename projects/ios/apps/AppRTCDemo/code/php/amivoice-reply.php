<?php

if (!is_dir("database/transcriptions/"))
{
	mkdir("database/transcriptions/", 0777, true);
}

$filename = $_POST['TaskId'];

$sjis = file_get_contents($_FILES['TsvFile']['tmp_name']);
$utf8 = iconv('shift-jis', 'utf-8'.'//TRANSLIT', $sjis);

$utf8 = preg_replace("(\\d\\d:\\d\\d:\\d\\d)", "", $utf8);
$utf8 = preg_replace("(\t)", "", $utf8);
$utf8 = preg_replace("(\r)", "", $utf8);

$arr = array();
$arr['ja'] = preg_replace("(\t\r)", "", $utf8);

if (file_put_contents("database/transcriptions/$filename.json", json_encode($arr)) != false)
{
	chmod("database/transcriptions/$filename.json", 0777);

	$result = array("status" => "success",
					"message" => "Wrote to $filename.json successfully");
}
else
{
	$result = array("status" => "fail",
					"message" => "Could not write to $filename.json");
}

print(json_encode($result));

?>
