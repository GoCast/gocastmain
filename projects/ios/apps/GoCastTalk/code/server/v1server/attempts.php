<?php

function read_attempt_file($name)
{
	$arr = array();

	if (is_file($GLOBALS['database']."/user/$name/attempt.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/user/$name/attempt.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}
	
	return $arr;
}

function write_attempt_file($name, $arr)
{
	$result = false;

	if (atomic_put_contents($GLOBALS['database']."/user/$name/attempt.json", json_encode($arr)) != false)
	{
		$result = true;
	}

	return $result;
}

function prune_expired_attempts($name)
{
	$changes	= false;
	$arr		= array();
	$arr2		= array();
	$t1			= timestamp_to_readabletime(time());

	$arr		= read_attempt_file($name);

	foreach($arr as $iter)
	{
		if (has_thirty_minutes_passed($iter["date"], $t1) == false)
		{
			array_push($arr2, $iter);
		}
		else
		{
			$changes = true;
		}
	}

	if ($changes)
	{
		write_attempt_file($name, $arr2);
	}
}

// [
// { "section": "resetEmail", "date": "201401019999", "attempts": "1" },
// { "section": "login", "date": "201401019999", "attempts": "1" }
// ]

function get_dangerous_attempt_count($name, $section)
{
	$count		= 0;

	$arr		= array();
	$arr		= read_attempt_file($name);

	foreach($arr as $iter)
	{
		if ($iter["section"] === $section)
		{
			$count = intval($iter["attempts"]);
		}
	}

	return $count;
}

function can_attempt_dangerous_action($name, $section)
{
	prune_expired_attempts($name);

	return get_dangerous_attempt_count($name, $section) < 5;
}

function note_dangerous_action($name, $section)
{
	$arr		= array();
	$arr2		= array();
	$arr		= read_attempt_file($name);

	foreach($arr as $iter)
	{
		if ($iter["section"] !== $section)
		{
			array_push($arr2, $iter);
		}
	}

	array_push($arr2, json_decode("{ \"section\": \"$section\", \"date\": \"".timestamp_to_readabletime(time())."\", \"attempts\": \"".(get_dangerous_attempt_count($name, $section) + 1)."\" }", true));


	write_attempt_file($name, $arr2);
}

?>
