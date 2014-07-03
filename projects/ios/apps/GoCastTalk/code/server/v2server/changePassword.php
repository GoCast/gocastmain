<?php

function changePassword($name, $password, $newpassword)
{
	if (can_attempt_dangerous_action($name, "changePassword"))
	{
		$note = true;

		$result = "";

		if (isntEmpty($name) && isntEmpty($password) && isntEmpty($newpassword))
		{
			if (verifyPassword($name, $password))
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
