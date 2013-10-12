<?php

function getFile($name, $file)
{
	if (is_file("database/inbox/$name/$file"))
	{
		$result = array(	"status" => "pass",
							"url" => "http://".
							$_SERVER['SERVER_NAME'].
							":".
							$_SERVER['SERVER_PORT'].
							"/inbox/$name/$file");
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "No such file in inbox");
	}
	return $result;
}

?>
