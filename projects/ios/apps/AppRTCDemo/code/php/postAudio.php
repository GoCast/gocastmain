<?php

function postAudio($name, $audio)
{
	if (!is_dir($GLOBALS['database']."/global/audio"))
	{
		mkdir($GLOBALS['database']."/global/audio", 0777, true);
	}

	if (copy($_FILES['filename']['tmp_name'], $GLOBALS['database']."/global/audio/$audio"))
	{
		chmod($GLOBALS['database']."/global/audio/$audio", 0777);

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
