<?php

function userList()
{
	if (is_file("database/accounts.json"))
	{
		$json = file_get_contents("database/accounts.json");
		$arr = json_decode($json, true);

		$arr2 = array_keys($arr);

		$result = array("status" => "success",
						"list" => $arr2);
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "No login file found");
	}
	return $result;
}

?>
