<?php

function write_device_user($name, $device)
{
	$result	= false;
	$json	= false;
	$arr	= array();

	if (!is_dir($GLOBALS['database']."/user/$name"))
	{
		mkdir($GLOBALS['database']."/user/$name", 0777, true);
	}

	if (is_file($GLOBALS['database']."/user/$name/devices.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/user/$name/devices.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	array_push($arr, json_decode('{"device": "'.$device.'"}', true));

	if (atomic_put_contents($GLOBALS['database']."/user/$name/devices.json", json_encode($arr)) != false)
	{
		$result = true;
	}

	return $result;
}

function remove_device_user($name, $device)
{
	$result	= false;
	$json	= false;
	$arr	= array();
	$arr2	= array();
	$found	= false;

	if (!is_dir($GLOBALS['database']."/user/$name"))
	{
		mkdir($GLOBALS['database']."/user/$name", 0777, true);
	}

	if (is_file($GLOBALS['database']."/user/$name/devices.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/user/$name/devices.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	foreach($arr as $iter)
	{
		if ($iter["device"] === $device)
		{
			$found = true;
		}
		else
		{
			array_push($arr2, $iter);
		}
	}

	if ($found)
	{
		if (atomic_put_contents($GLOBALS['database']."/user/$name/devices.json", json_encode($arr2)) != false)
		{
			$result = true;
		}
	}

	return $result;
}

function verify_device_user($name, $device)
{
	$result	= false;
	$json	= false;
	$arr	= array();

	if (!is_dir($GLOBALS['database']."/user/$name"))
	{
		mkdir($GLOBALS['database']."/user/$name", 0777, true);
	}

	if (is_file($GLOBALS['database']."/user/$name/devices.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/user/$name/devices.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	foreach($arr as $iter)
	{
		if ($iter["device"] === $device)
		{
			$result = true;
			break;
		}
	}

	return $result;
}

function add_new_device($name, $device)
{
	if (!empty($device))
	{
		if (!verify_device_user($name, $device))
		{
			if (write_device_user($name, $device))
			{
				return $device;
			}
		}
	}
	return false;
}

function remove_new_device($name, $device)
{
	if (!empty($device))
	{
		if (verify_device_user($name, $device))
		{
			return remove_device_user($name, $device);
		}
	}
}

?>
