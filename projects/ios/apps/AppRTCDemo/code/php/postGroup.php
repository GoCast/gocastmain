<?php

function postGroup($from, $group, $filename)
{
	$anyerror = false;

	foreach($group as $member)
	{
		if (!is_dir("database/inbox/$member"))
		{
			mkdir("database/inbox/$member", 0777, true);
		}

		if (file_put_contents("database/inbox/$member/$from-$filename", "hello") == false)
		{
			$anyerror = true;
		}
	}

	if ($anyerror == false)
	{
		$result = array("status" => "success",
						"message" => "Posted to group successfully");
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "Couldn't post to group");
	}

	return $result;
}

?>
