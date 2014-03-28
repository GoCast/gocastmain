<?php

function setContacts($name)
{
	if (userExists($name))
	{
		if (!is_dir("database/user/$name"))
		{
			mkdir("database/user/$name", 0777, true);
		}

		$json = atomic_get_contents($_FILES['filename']['tmp_name']);
		json_decode($json, true);

		if (json_last_error() == JSON_ERROR_NONE)
		{
			if (copy($_FILES['filename']['tmp_name'], "database/user/$name/contacts.json"))
			{
				chmod("database/user/$name/contacts.json", 0777);

				$result = array("status" => "success",
								"message" => "Updated profile successfully");
			}
			else
			{
				$result = array("status" => "fail",
								"message" => "Could not copy upload to $name's contacts.json");
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
