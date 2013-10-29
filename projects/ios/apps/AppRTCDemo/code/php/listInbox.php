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
		if (!is_dir("database/user/$name/inbox"))
		{
			mkdir("database/user/$name/inbox", 0777, true);
		}

		if (is_dir("database/user/$name/inbox"))
		{
			$arr2 = scandir("database/user/$name/inbox");

			if ($arr2 != false)
			{
				$result = array(	"status" => "success",
									"list" => $arr2);

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
