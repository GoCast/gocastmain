<?php
function validUsers($name, $authToken)
{
	$obj = checkAuthToken($name, $authToken);
	if ($obj->status != "success")
	{
		return $obj;
	}
	$file = $_FILES['filename']['tmp_name'];
	if (!is_file($file))
	{
		return array("status" => "fail", "message" => "Could not open uploaded file");
	}
	$jarr = json_decode(file_get_contents($file), true);
	if ($jarr == null)
	{
		return array("status" => "fail", "message" => "Uploaded file is not valid JSON");
	}
	if (!isset($jarr["users"]))
	{
		return array("status" => "fail", "message" => "JSON missing \"users\" array");
	}
	$members = array();
	$nonmembers = array();
	foreach($jarr["users"] as $user)
	{
		$result = getCurlStatus("validate&username=$user","user valid","fail","invalid");
		if ($result->status === "success")
		{
			array_push($members, $user);
		}
		else
		{
			array_push($nonmembers, $user);
		}
	}

	$result = array("status" => "success",
					"message" => "User validation was successful",
					"registered" => $members,
					"unregistered" => $nonmembers);
	return $result;
}
