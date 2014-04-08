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
	if (is_file($GLOBALS['database']."/accounts.json"))
	{
		$members = array();
		$nonmembers = array();

		$json = atomic_get_contents($GLOBALS['database']."/accounts.json");
		$list = json_decode($json, true);

		if (is_file($_FILES['filename']['tmp_name']))
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
							"message" => "Could not open uploaded file");
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
