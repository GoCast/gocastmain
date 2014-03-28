<?php

function changePassword($name, $password, $newpassword)
{
	if (is_file($GLOBALS['database']."/accounts.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/accounts.json");
		$arr = json_decode($json, true);

		if(isset($arr[$name]) && !empty($arr[$name]))
		{
			if ($arr[$name] === $password)
			{
				$arr[$name] = $newpassword;

				ksort($arr);

				if (atomic_put_contents($GLOBALS['database']."/accounts.json", json_encode($arr)) != false)
				{
					$result = array("status" => "success",
									"message" => "Password was changed");
				}
			}
			else
			{
				$result = array("status" => "fail",
								"message" => "Old password is incorrect");
			}
		}
		else
		{
			$result = array("status" => "fail",
							"message" => "User does not exist");
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
