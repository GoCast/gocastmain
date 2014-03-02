<?php

function setGroups($name)
{
	if (userExists($name))
	{
		if (!is_dir("database/user/$name"))
		{
			mkdir("database/user/$name", 0777, true);
		}

		if (copy($_FILES['filename']['tmp_name'], "database/user/$name/groups.json"))
		{
			chmod("database/user/$name/groups.json", 0777);

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
						"message" => "User does not exist");
	}

	return $result;

}

?>
