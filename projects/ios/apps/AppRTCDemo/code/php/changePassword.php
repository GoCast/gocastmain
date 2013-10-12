<?php

function changePassword($name, $password, $newpassword)
{
	if (is_file("database/accounts.json"))
	{
		$json = file_get_contents("database/accounts.json");
		$arr = json_decode($json, true);

		if(isset($arr[$name]) && !empty($arr[$name]))
		{
			if ($arr[$name] === $password)
			{
				$arr[$name] = $newpassword;

				ksort($arr);

				if (file_put_contents("database/accounts.json", json_encode($arr)) != false)
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
