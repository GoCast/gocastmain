<?php

function postGroup($from, $group, $filename)
{
	$anyerror = false;

	foreach($group as $member)
	{
		if (!is_dir("database/user/$member/inbox"))
		{
			mkdir("database/user/$member/inbox", 0777, true);
		}

		$shortfrom = substr($from, 0, strpos($from, "@"));
		if (copy($_FILES['filename']['tmp_name'], "database/user/$member/inbox/$filename-$shortfrom") == false)
		{
			$anyerror = true;
		}
		else
		{
			chmod("database/user/$member/inbox/$filename-$shortfrom", 0777);
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
