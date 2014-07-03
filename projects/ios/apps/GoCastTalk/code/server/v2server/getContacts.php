<?php

function getContacts($name)
{
	if (userExists($name))
	{
		ensure_database_dir("/user/$name");

		$arr = array();
		$arr["contacts"] = array();
		if (is_file($GLOBALS['database']."/user/$name/contacts.json"))
		{
			$json = atomic_get_contents($GLOBALS['database']."/user/$name/contacts.json");
			$arr = json_decode($json, true);
		}

		$result = array(	"status" => "success",
							"contacts" => $arr);
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "User does not exist");
	}

	return $result;
}

?>
