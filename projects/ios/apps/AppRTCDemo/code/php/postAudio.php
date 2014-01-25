<?php

function postAudio($name, $audio)
{
	if (!is_dir("database/global/audio"))
	{
		mkdir("database/global/audio", 0777, true);
	}

	if (copy($_FILES['filename']['tmp_name'], "database/global/audio/$audio"))
	{
		chmod("database/global/audio/$audio", 0777);

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
