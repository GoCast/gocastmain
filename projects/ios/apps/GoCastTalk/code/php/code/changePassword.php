<?php

function getPassword($name)
{
	$result = "";

	if (is_file($GLOBALS['database']."/accounts.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/accounts.json");
		$arr = json_decode($json, true);

		if(isset($arr[$name]) && !empty($arr[$name]))
		{
			$result = $arr[$name];
		}
	}

	return $result;
}

function setPassword($name, $newpassword)
{
	$result = false;

	if (is_file($GLOBALS['database']."/accounts.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/accounts.json");
		$arr = json_decode($json, true);

		$arr[$name] = $newpassword;

		ksort($arr);

		if (atomic_put_contents($GLOBALS['database']."/accounts.json", json_encode($arr)) != false)
		{
			$result = true;
		}
	}

	return $result;
}

function changePassword($name, $password, $newpassword)
{
	if (can_attempt_dangerous_action($name, "changePassword"))
	{
		$note = true;

		$result = "";
		$oldpassword = getPassword($name);

		if (isntEmpty($name) && isntEmpty($password) && isntEmpty($newpassword))
		{
			if ($password === $oldpassword)
			{
				if (setPassword($name, $newpassword))
				{
					$result = array("status" => "success",
									"message" => "Password was changed");

					$note = false;
				}
				else
				{
					$result = array("status" => "fail",
									"message" => "Couldn't write to login file");
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
							"message" => "No login file found");
		}
	}
	else
	{
		$result = array("status" => "locked",
						"message" => "Account locked");
	}

	if ($note)
	{
		note_dangerous_action($name, "changePassword");
	}

	return $result;
}

?>
