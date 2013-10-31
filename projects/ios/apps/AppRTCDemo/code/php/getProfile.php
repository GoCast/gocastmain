<?php

function getProfile($name)
{
	if (userExists($name))
	{
		if (!is_dir("database/user/$name"))
		{
			mkdir("database/user/$name", 0777, true);
		}

		$arr = array();
		$arr["profile"] = array();
		if (is_file("database/user/$name/profile.json"))
		{
			$json = file_get_contents("database/user/$name/profile.json");
			$arr = json_decode($json, true);
		}

		$result = array(	"status" => "success",
							"profile" => $arr["profile"]);
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "User does not exist");
	}

	return $result;
}

?>
