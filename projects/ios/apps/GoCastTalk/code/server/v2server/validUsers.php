<?php

function validateOneUser($list, $user)
{
	if(isset($list[$user]) && !empty($list[$user]))
	{
		return true;
	}
	else
	{
		return false;
	}
}

function validUsers()
{
	if (is_file($GLOBALS['database']."/accounts-hashed.json"))
	{
		$members = array();
		$nonmembers = array();

		$json = atomic_get_contents($GLOBALS['database']."/accounts-hashed.json");
		$list = json_decode($json, true);

		if (get_file_size($_FILES['filename']['tmp_name']) < (2 * 1024 * 1024))
		{
			$json = atomic_get_contents($_FILES['filename']['tmp_name']);
	
			if ($json != false)
			{
				$arr = json_decode($json, true);
	
				if (isset($arr["users"]))
				{
					foreach($arr["users"] as $item)
					{
						if (validateOneUser($list, $item))
						{
							array_push($members, $item);
						}
						else
						{
							array_push($nonmembers, $item);
						}
					}

					$result = array("status" => "success",
									"message" => "User validation was successful",
									"registered" => $members,
									"unregistered" => $nonmembers);
				}
				else
				{
					$result = array("status" => "fail",
									"message" => "JSON missing \"users\" array");
				}
			}
			else
			{
				$result = array("status" => "fail",
								"message" => "Uploaded file is not valid JSON");
			}
		}
		else
		{
			$result = array("status" => "fail",
							"message" => "File is too large");
		}
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "No login file found");
	}

	return $result;
}

?>
