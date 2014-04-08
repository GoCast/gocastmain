<?php

function listMessages($name)
{
	if (userExists($name))
	{
		if (!is_dir($GLOBALS['database']."/user/$name"))
		{
			mkdir($GLOBALS['database']."/user/$name", 0777, true);
		}

		if (is_dir($GLOBALS['database']."/user/$name"))
		{
			$json = false;

			if (is_file($GLOBALS['database']."/user/$name/messages.json"))
			{
				$json = atomic_get_contents($GLOBALS['database']."/user/$name/messages.json");
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

			$arr2 = array();
			foreach($arr as $item)
			{
				$trans_file = $GLOBALS['database']."/global/text/".$item["audio"].".json";

				if (is_file($trans_file))
				{
					$item["transcription"] = json_decode(atomic_get_contents($trans_file), true);
				}
				else
				{
					$item["transcription"] = json_decode("{\"ja\":\"\"}", true);
				}

				array_push($arr2, $item);
			}

			$arr = $arr2;

			$result = array("status" => "success",
							"message" => "Message list successful",
							"list" => $arr);
		}
		else
		{
			$result = array("status" => "fail",
							"message" => "User directory does not exist");
		}
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "User does not exist");
	}
	return $result;
}

?>
