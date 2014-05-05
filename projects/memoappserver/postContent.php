<?php

function postContent($from, $group, $filename, $authToken)
{
	$obj = checkAuthToken($name,$authToken);
	if ($obj->status !== "success")
	{
		return $obj;
	}
	if (!is_dir("database/audiocache/"))
	{
		mkdir("database/audiocache/", 0777, true);
	}

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
			copy($_FILES['filename']['tmp_name'], "database/audiocache/$filename-$shortfrom");

			chmod("database/user/$member/inbox/$filename-$shortfrom", 0777);
			chmod("database/audiocache/$filename-$shortfrom", 0777);
		}
	}

// 	nuancePost("$filename-$shortfrom");

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
