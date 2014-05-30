<?php

function register($name, $password, $device)
{
	$name = trim($name);
	$password = trim($password);

	if (isntEmpty($name) && isntEmpty($password))
	{
		if (!is_dir($GLOBALS['database']."/"))
		{
			mkdir($GLOBALS['database']."/", 0777, true);
		}

		$json = false;

		if (is_file($GLOBALS['database']."/accounts.json"))
		{
			$json = atomic_get_contents($GLOBALS['database']."/accounts.json");
		}

		if ($json != false)
		{
			$arr = json_decode($json, true);
		}
		else
		{
			$json = "";
			$arr = array();
		}

		if(!isset($arr[$name]) || empty($arr[$name]))
		{
			$arr[$name] = $password;

			ksort($arr);

			if (atomic_put_contents($GLOBALS['database']."/accounts.json", json_encode($arr)) != false)
			{
				$token = add_new_token($name);

				if ($token != false)
				{
					$user		= json_decode( '{ "authToken": "' . $token . '" }', true);

					add_new_device($name, $device);

					$result = array("status" => "success",
									"message" => "User successfully registered",
									"user" => $user);
				}
				else
				{
					$result = array("status" => "fail",
									"message" => "Token generation failed");
				}
			}
			else
			{
				$result = array("status" => "fail",
								"message" => "Could not write user to database");
			}
		}
		else
		{
			$result = array("status" => "fail",
							"message" => "User already exists");
		}
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "User name or password invalid");
	}

	return $result;
}

?>
