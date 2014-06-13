<?php

function write_token_user($name, $token)
{
	$result	= false;
	$json	= false;
	$arr	= array();

	ensure_database_dir("/user/$name");

	if (is_file($GLOBALS['database']."/user/$name/tokens.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/user/$name/tokens.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	array_push($arr, json_decode('{"token": "'.$token.'", "date": "1999010101010101"}', true));

	if (atomic_put_contents($GLOBALS['database']."/user/$name/tokens.json", json_encode($arr)) != false)
	{
		$result = true;
	}

	return $result;
}

function write_token_global($name, $token)
{
	$result	= false;
	$json	= false;
	$arr	= array();

	ensure_database_dir("/global");

	if (is_file($GLOBALS['database']."/global/tokens.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/global/tokens.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	array_push($arr, json_decode('{"name":"'.$name.'", "token": "'.$token.'", "date": "1999010101010101"}', true));

	if (atomic_put_contents($GLOBALS['database']."/global/tokens.json", json_encode($arr)) != false)
	{
		$result = true;
	}

	return $result;
}

function remove_token_user($name, $token)
{
	$result	= false;
	$json	= false;
	$arr	= array();
	$arr2	= array();
	$found	= false;

	ensure_database_dir("/user/$name");

	if (is_file($GLOBALS['database']."/user/$name/tokens.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/user/$name/tokens.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	foreach($arr as $iter)
	{
		if ($iter["token"] === $token)
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
		if (atomic_put_contents($GLOBALS['database']."/user/$name/tokens.json", json_encode($arr2)) != false)
		{
			$result = true;
		}
	}

	return $result;
}

function verify_token_user($name, $token)
{
	$result	= false;
	$json	= false;
	$arr	= array();

	ensure_database_dir("/user/$name");

	if (is_file($GLOBALS['database']."/user/$name/tokens.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/user/$name/tokens.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	foreach($arr as $iter)
	{
		if ($iter["token"] === $token)
		{
			$result = true;
			break;
		}
	}

	return $result;
}

function add_new_token($name)
{
	$token = bin2hex(openssl_random_pseudo_bytes(32));

	if (write_token_user($name, $token))
	{
		return $token;
	}

	return false;
}

function remove_new_token($name, $token)
{
	return remove_token_user($name, $token);
}

?>
