<?php

function pmAppend($user, $data)
{
	$result = false;

	if (!is_dir("database/user/$user"))
	{
		mkdir("database/user/$user", 0777, true);
	}

	$json = false;
	$arr  = array();

	if (is_file("database/user/$user/messages.json"))
	{
		$json = atomic_get_contents("database/user/$user/messages.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	array_push($arr, json_decode($data, true));

	if (atomic_put_contents("database/user/$user/messages.json", json_encode($arr, true)))
	{
		$result = true;
	}

	return $result;
}

function postMessage($name)
{
	$hadErrors = false;

	if (!is_dir("database/global/text"))
	{
		mkdir("database/global/text", 0777, true);
	}

	$json = false;
	$arr  = array();
	
	if (is_file($_FILES['filename']['tmp_name']))
	{
		$json = atomic_get_contents($_FILES['filename']['tmp_name']);
		
		if ($json != false)
		{
			$arr = json_decode($json, true);
		
			if (pmAppend($arr["from"], $json))
			{
				foreach($arr["to"] as $item)
				{
					if (strcmp($item, $arr["from"]) != 0)
					{
						if (!pmAppend($item, $json))
						{
							$hadErrors = true;
						}
					}
				}
			}
			else
			{
				$hadErrors = true;
			}
		}
		else
		{
			$hadErrors = true;
		}
	}
	else
	{
		$hadErrors = true;
	}

	if (!$hadErrors)
	{
		$result = array("status" => "success",
						"message" => "Post message was successful");
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "Post message failed");
	}

	return $result;
}

?>
