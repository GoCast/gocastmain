<?php

function listMessages($name,$authToken)
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
	$list = array();
	$arr = json_decode($status["json"], true);
	foreach($arr as $item)
	{
		$trans_file = "database/global/text/".$item["audio"].".json";

		if (is_file($trans_file))
		{
			$item["transcription"] = json_decode(file_get_contents($trans_file), true);
		}
		else
		{
			$item["transcription"] = json_decode("{\"ja\":\"Transcription not available\"}", true);
		}
		array_push($list, $item);
	}
	return  array("status" => "success", "message" => "Message list successful", "list" => $list);
}
function getMessagesJson($name)
{
	$path = "database/user/$name";
	if (!is_dir("$path"))
	{
		mkdir("$path", 0777, true);
	}

	if (!is_dir("$path"))
	{
		return array("status" => "fail", "message" => "User directory does not exist");
	}
	if (is_file("$path/messages.json"))
	{
		$json = file_get_contents("$path/messages.json");
		return array("status" => "success", "json"=>$json);
	}
	return  array("status" => "success", "message" => "no messages");
}
