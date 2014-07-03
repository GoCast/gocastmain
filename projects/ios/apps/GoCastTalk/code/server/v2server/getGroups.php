<?php

function getGroups($name)
{
	if (userExists($name))
	{
		ensure_database_dir("/user/$name");

		$arr = array();
		$arr["groups"] = array();
		if (is_file($GLOBALS['database']."/user/$name/groups.json"))
		{
			$json = atomic_get_contents($GLOBALS['database']."/user/$name/groups.json");
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
