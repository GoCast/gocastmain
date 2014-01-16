<?php

function userExists($name)
{
	if (is_file("database/accounts.json"))
	{
		$json = file_get_contents("database/accounts.json");
		$arr = json_decode($json, true);

		if(isset($arr[$name]) && !empty($arr[$name]))
		{
			return true;
		}
	}

	return false;
}

function hasParam($x)
{
	if( (isset($_GET[$x]) && !empty($_GET[$x])) ||
		(isset($_POST[$x]) && !empty($_POST[$x])) )
	{
		return true;
	}

	return false;
}

function errorMissingParameter($x)
{
	return array(	"status" => "fail",
					"message" => "Missing parameter: $x");
}

?>
