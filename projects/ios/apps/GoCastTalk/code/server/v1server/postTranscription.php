<?php

function postTranscription($name, $audio)
{
	ensure_database_dir("/global/text");

	if (get_file_size($_FILES['filename']['tmp_name']) < (2 * 1024 * 1024))
	{
		if (copy($_FILES['filename']['tmp_name'], $GLOBALS['database']."/global/text/$audio".".json"))
		{
			chmod($GLOBALS['database']."/global/text/$audio".".json", $GLOBALS['fmode']);

			$result = array("status" => "success",
							"message" => "Upload and move successful");
		}
		else
		{
			$result = array("status" => "fail",
							"message" => "Upload success but move failed");
		}
	}
	else
	{
			$result = array("status" => "fail",
							"message" => "File is too large");
	}

	return $result;
}

?>
