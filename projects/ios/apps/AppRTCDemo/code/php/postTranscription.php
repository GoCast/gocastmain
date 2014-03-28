<?php

function postTranscription($name, $audio)
{
	if (!is_dir($GLOBALS['database']."/global/text"))
	{
		mkdir($GLOBALS['database']."/global/text", 0777, true);
	}

	if (copy($_FILES['filename']['tmp_name'], $GLOBALS['database']."/global/text/$audio".".json"))
	{
		chmod($GLOBALS['database']."/global/text/$audio".".json", 0777);

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
