<?php

function login($name, $password, $device)
{
	if (can_attempt_dangerous_action($name, "login"))
	{
		$note = true;

		$name = trim($name);
		$password = trim($password);

		if (isntEmpty($name) && isntEmpty($password))
		{
			$exists = userExists($name);

			if ($exists != false)
			{
				if (verifyPassword($name, $password))
				{
					$token = add_new_token($name);

					if ($token != false)
					{
						$user		= json_decode( '{ "authToken": "' . $token . '" }', true);

						add_new_device($name, $device);

						$result = array("status" => "success",
										"message" => "Login was successful",
										"user" => $user);

						$note = false;
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
									"message" => "Password is incorrect");
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
							"message" => "User name or password invalid");
		}
	}
	else
	{
		$result = array("status" => "locked",
						"message" => "Account locked");
	}

	if ($note)
	{
		note_dangerous_action($name, "login");
	}

	return $result;
}

?>
