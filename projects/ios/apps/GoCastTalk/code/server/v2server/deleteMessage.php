<?php

function deleteMessage($name, $audio)
{
	if (userExists($name))
	{
		ensure_database_dir("/user/$name");

		if (is_dir($GLOBALS['database']."/user/$name"))
		{
			$json = false;

			if (is_file($GLOBALS['database']."/user/$name/messages.json"))
			{
				$json = atomic_get_contents($GLOBALS['database']."/user/$name/messages.json");

				if ($json != false)
				{
					$arr = json_decode($json, true);

					$arr2 = array();

					$found = false;

					foreach($arr as $item)
					{
						if (strcmp($item["audio"], $audio) != 0)
						{
							array_push($arr2, $item);
						}
						else
						{
							$found = true;
						}
					}
					
					if ($found)
					{
						if (atomic_put_contents($GLOBALS['database']."/user/$name/messages.json", json_encode($arr2, true)))
						{
							$result = array("status" => "success",
											"message" => "Delete successful");
						}
						else
						{
							$result = array("status" => "fail",
											"message" => "Couldn't write inbox file");
						}
					}
					else
					{
						$result = array("status" => "fail",
										"message" => "Couldn't find message to delete");
					}
				}
				else
				{
					$result = array("status" => "fail",
									"message" => "User inbox is empty");
				}
			}
			else
			{
				$result = array("status" => "fail",
								"message" => "User inbox does not exist");
			}
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
