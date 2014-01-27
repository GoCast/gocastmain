<?php

function listMessages($name)
{
	if (userExists($name))
	{
		if (!is_dir("database/user/$name"))
		{
			mkdir("database/user/$name", 0777, true);
		}

		if (is_dir("database/user/$name"))
		{
			$json = false;

			if (is_file("database/user/$name/messages.json"))
			{
				$json = file_get_contents("database/user/$name/messages.json");
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
				$trans_file = "database/global/text/".$item["audio"].".json";

				if (is_file($trans_file))
				{
					$item["transcription"] = json_decode(file_get_contents($trans_file), true);
				}
				else
				{
					$item["transcription"] = json_decode("{\"ja\":\"Transcription not available\"}", true);
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
