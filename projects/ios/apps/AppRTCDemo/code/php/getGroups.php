<?php

function getGroups($name)
{
	if (userExists($name))
	{
		if (!is_dir("database/user/$name"))
		{
			mkdir("database/user/$name", 0777, true);
		}

		$arr = array();
		$arr["groups"] = array();
		if (is_file("database/user/$name/groups.json"))
		{
			$json = atomic_get_contents("database/user/$name/groups.json");
			$arr = json_decode($json, true);
		}

		$result = array(	"status" => "success",
							"groups" => $arr);
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "User does not exist");
	}

	return $result;
}

?>
