<?php

function pmAppend($user, $data)
{
	$result = false;

	ensure_database_dir("/user/$user");

	$json = false;
	$arr  = array();

	if (is_file($GLOBALS['database']."/user/$user/messages.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/user/$user/messages.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	array_push($arr, json_decode($data, true));

	if (atomic_put_contents($GLOBALS['database']."/user/$user/messages.json", json_encode($arr, true)))
	{
		$result = true;
	}

	return $result;
}

function getTranscriptForPostMessage($audio)
{
	$trans_file = $GLOBALS['database']."/global/text/".$audio.".json";

	if (is_file($trans_file))
	{
		$result = json_decode(atomic_get_contents($trans_file), true);

		return $result["ja"];
	}

	return "";
}

function postMessage($name)
{
	$hadErrors = false;

	ensure_database_dir("/global/text");

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
				$trans = getTranscriptForPostMessage($arr["audio"]);

				$message = $arr["from"];

				if (!empty($trans))
				{
					$message = $message . ": \n「 " . $trans . " 」";
				}

				foreach($arr["to"] as $item)
				{
					if (strcmp($item, $arr["from"]) != 0)
					{
						push_to_name($item, $message);

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
