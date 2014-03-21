<?php

function register($name, $password)
{
	if (!is_dir("database/"))
	{
		mkdir("database/", 0777, true);
	}

	$json = false;

	if (is_file("database/accounts.json"))
	{
		$json = atomic_get_contents("database/accounts.json");
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

		if (atomic_put_contents("database/accounts.json", json_encode($arr)) != false)
		{
			$result = array("status" => "success",
							"message" => "User successfully registered");
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

	return $result;
}

?>
