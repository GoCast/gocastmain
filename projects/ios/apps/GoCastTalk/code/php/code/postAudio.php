<?php

function postAudio($name, $audio)
{
	ensure_database_dir("/global/audio");

	if (copy($_FILES['filename']['tmp_name'], $GLOBALS['database']."/global/audio/$audio"))
	{
		chmod($GLOBALS['database']."/global/audio/$audio", $GLOBALS['fmode']);

		$result = array("status" => "success",
						"message" => "Upload and move successful");
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "Upload success but move failed");
	}

	return $result;
}

?>
