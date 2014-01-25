<?php

function postTranscription($name, $audio)
{
	if (!is_dir("database/global/text"))
	{
		mkdir("database/global/text", 0777, true);
	}

	if (copy($_FILES['filename']['tmp_name'], "database/global/text/$audio".".json"))
	{
		chmod("database/global/text/$audio".".json", 0777);

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
