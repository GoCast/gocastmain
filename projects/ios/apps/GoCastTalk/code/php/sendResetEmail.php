<?php

function write_pin_user($name, $pin)
{
	$result	= false;
	$json	= "";

	if (!is_dir($GLOBALS['database']."/user/$name"))
	{
		mkdir($GLOBALS['database']."/user/$name", 0777, true);
	}

	$json = '[{"pin" : "'.$pin.'"}]';

	if (atomic_put_contents($GLOBALS['database']."/user/$name/pin.json", $json) != false)
	{
		$result = true;
	}

	return $result;
}

function remove_pin_user($name)
{
	$result = false;

	if (is_file($GLOBALS['database']."/user/$name/pin.json"))
	{
		$result = @unlink($GLOBALS['database']."/user/$name/pin.json");
	}

	return $result;
}

function verify_pin_user($name, $pin)
{
	$result	= false;
	$json	= false;
	$arr	= array();

	if (!is_dir($GLOBALS['database']."/user/$name"))
	{
		mkdir($GLOBALS['database']."/user/$name", 0777, true);
	}

	if (is_file($GLOBALS['database']."/user/$name/pin.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/user/$name/pin.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}

	foreach($arr as $iter)
	{
		if ($iter["pin"] === $pin)
		{
			$result = true;
			break;
		}
	}

	return $result;
}

function generate_pin()
{
	$result = bin2hex(openssl_random_pseudo_bytes(3));

	for($i = 0; $i < 6; $i++)
	{
		switch($result[$i])
		{
			case 'a': $result[$i] = '0'; break;
			case 'b': $result[$i] = '1'; break;
			case 'c': $result[$i] = '2'; break;
			case 'd': $result[$i] = '3'; break;
			case 'e': $result[$i] = '4'; break;
			case 'f': $result[$i] = '5'; break;
			default: break;
		}
	}

	return $result;
}

function sendResetEmail($name, $lang)
{
	$pin = generate_pin();
	
	write_pin_user($name, $pin);
	$shresult = shell_exec('./mailgun.'.$lang.'.sh '.$name.' '.$pin);

	$result = array("status" => "success",
					"message" => "Pin created");

	return $result;
}

function verifyPin($name, $pin)
{
	if (verify_pin_user($name, $pin))
	{
		remove_pin_user($name);
		setPassword($name, "pin".$pin);

		$result = array("status" => "success",
						"message" => "Pin matches");
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "Pin does not match");
	}

	return $result;
}

?>
