<?php

function deleteFile($name, $file)
{
	if (is_file("database/user/$name/inbox/$file"))
	{
		if (unlink("database/user/$name/inbox/$file"))
		{
			$result = array(	"status" => "success",
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
