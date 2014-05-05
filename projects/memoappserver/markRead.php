<?php

function markRead($name, $audio, $authToken)
{
	$obj = checkAuthToken($name, $authToken);
	if ($obj->status != "success")
	{
		return $obj;
	}
	$status = getMessagesJson($name);
	if (empty($status["json"]))
	{
		return $status;
	}
	$arr = json_decode($status["json"], true);

	$arr2 = array();

	$found = false;

	foreach($arr as $item)
	{
		if (strcmp($item["audio"], $audio) == 0)
		{
			$item["read"] = "yes";
			$found = true;
		}

		array_push($arr2, $item);
	}
	
	if ($found)
	{
		if (file_put_contents("database/user/$name/messages.json", json_encode($arr2, true)))
		{
			return array("status" => "success", "message" => "Mark read successful");
		}
		return array("status" => "fail", "message" => "Couldn't write inbox file");
	}
	return array("status" => "fail", "message" => "Couldn't find message to mark read");
}
