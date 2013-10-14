<?php

function userList()
{
	if (is_file("database/accounts.json"))
	{
		$json = file_get_contents("database/accounts.json");
		$arr = json_decode($json, true);

		$arr2 = array_keys($arr);

		$i = 0;
		$c = count($arr2);

		$flat_list = "";
		foreach ($arr2 as $v)
		{
			$i++;

			if ($i < $c)
			{
				$flat_list = $flat_list.$v.',';
			}
			else
			{
				$flat_list = $flat_list.$v;
			}
		}

		$result = array("status" => "success",
						"list" => $flat_list);
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "No login file found");
	}
	return $result;
}

?>
