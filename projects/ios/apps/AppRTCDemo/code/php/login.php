<?php

function login($name, $password)
{
	if (is_file("database/accounts.json"))
	{
		$json = atomic_get_contents("database/accounts.json");
		$arr = json_decode($json, true);

		if(isset($arr[$name]) && !empty($arr[$name]))
		{
			if ($arr[$name] === $password)
			{
				$result = array("status" => "success",
								"message" => "Login was successful");
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
						"message" => "No login file found");
	}
	return $result;
}

?>
