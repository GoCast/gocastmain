<?php

function register($name, $password, $device)
{
	$result = "";

	$name = trim($name);
	$password = trim($password);

	if (isntEmpty($name) && isntEmpty($password))
	{
		ensure_database_dir("/");

		$exists = userExists($name);

		if ($exists == false)
		{
			$exists = setPassword($name, $password);

			if ($exists != false)
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
