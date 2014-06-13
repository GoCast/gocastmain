<?php

function setGroups($name)
{
	if (userExists($name))
	{
		ensure_database_dir("/user/$name");

		$json = atomic_get_contents($_FILES['filename']['tmp_name']);
		json_decode($json, true);

		if (json_last_error() == JSON_ERROR_NONE)
		{
			if (copy($_FILES['filename']['tmp_name'], $GLOBALS['database']."/user/$name/groups.json"))
			{
				chmod($GLOBALS['database']."/user/$name/groups.json", $GLOBALS['fmode']);

				$result = array("status" => "success",
								"message" => "Updated profile successfully");
			}
			else
			{
				$result = array("status" => "fail",
								"message" => "Could not copy upload to $name's groups.json");
			}
		}
		else
		{
			$result = array("status" => "fail",
							"message" => "Invalid format");
		}
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "User does not exist");
	}

	return $result;

}

?>
