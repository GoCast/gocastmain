<?php

function postTranscription($from, $filename)
{
	$shortfrom = substr($from, 0, strpos($from, "@"));

	if (copy($_FILES['filename']['tmp_name'], "database/transcriptions/$filename-$shortfrom.json"))
	{
		chmod("database/transcriptions/$filename-$shortfrom.json", 0777);

		$result = array("status" => "success",
						"message" => "Post transcription successfully");
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "Could not copy upload to transcription");
	}

	return $result;

}

?>
