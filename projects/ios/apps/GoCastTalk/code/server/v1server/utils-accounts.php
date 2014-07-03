<?php

function verifyPassword($name, $password)
{
	$result = false;

	if (is_file($GLOBALS['database']."/accounts-hashed.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/accounts-hashed.json");
		$arr = json_decode($json, true);

		if(isset($arr[$name]) && !empty($arr[$name]))
		{
			$hash = $arr[$name];

			if ($hash != false)
			{
				$full_salt = substr($hash, 0, 29);

				$new_hash = crypt($password, $full_salt);

				$result = ($hash === $new_hash);
			}
		}
	}

	return $result;
}

function setPassword($name, $newpassword)
{
	$result = false;
	$arr = array();

	if (is_file($GLOBALS['database']."/accounts-hashed.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/accounts-hashed.json");
		$arr = json_decode($json, true);
	}

	$arr[$name] = crypt(	$newpassword,
							'$2a'.'$10'.'$'.substr(sha1(mt_rand()),0,22));

	ksort($arr);

	if (atomic_put_contents($GLOBALS['database']."/accounts-hashed.json", json_encode($arr)) != false)
	{
		$result = true;
	}

	return $result;
}

function one_time_hash()
{
	$json = atomic_get_contents($GLOBALS['database']."/accounts.json");
	$list = json_decode($json, true);

	foreach($list as $key => $value)
	{
		setPassword($key, $value);
	}
}

// one_time_hash();

?>
