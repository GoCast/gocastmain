<?php

function deleteFile($name, $file)
{
	if (is_file("database/inbox/$name/$file"))
	{
		if (unlink("database/inbox/$name/$file"))
		{
			$result = array(	"status" => "pass",
								"message" => "File deleted on server successfully");
		}
		else
		{
			$result = array("status" => "fail",
							"message" => "Could not delete file on server.");
		}
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "No such file in inbox");
	}
	return $result;
}

?>
