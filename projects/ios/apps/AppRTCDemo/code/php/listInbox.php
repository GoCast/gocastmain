<?php

function userExists($name)
{
	if (is_file("database/accounts.json"))
	{
		$json = file_get_contents("database/accounts.json");
		$arr = json_decode($json, true);

		if(isset($arr[$name]) && !empty($arr[$name]))
		{
			return true;
		}
	}

	return false;
}


function listInbox($name)
{
	if (userExists($name))
	{
		if (!is_dir("database/inbox/$name"))
		{
			mkdir("database/inbox/$name", 0777, true);
		}

		if (is_dir("database/inbox/$name"))
		{
			$arr = scandir("database/inbox/$name");

			if ($arr != false)
			{
				$result = array(	"status" => "pass",
									"list" => $arr);

			}
			else
			{
				$result = array("status" => "fail",
								"message" => "Directory listing failed");
			}
		}
		else
		{
			$result = array("status" => "fail",
							"message" => "Inbox does not exist");
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
