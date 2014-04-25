<?php

function apple_push($device, $message)
{
	$result = false;

	$passphrase = 'abc123';

	$ctx = stream_context_create();
	stream_context_set_option($ctx, 'ssl', 'local_cert', 'applePush.pem');
	stream_context_set_option($ctx, 'ssl', 'passphrase', $passphrase);

	// Open a connection to the APNS server
	$fp = stream_socket_client(
		'ssl://gateway.sandbox.push.apple.com:2195', $err,
		$errstr, 60, STREAM_CLIENT_CONNECT|STREAM_CLIENT_PERSISTENT, $ctx);

	if ($fp)
	{
		// Create the payload body
		$body['aps'] = array(
			'alert' => $message,
			'sound' => 'default'
			);

		// Encode the payload as JSON
		$payload = json_encode($body);

		// Build the binary notification
		$msg = chr(0) . pack('n', 32) . pack('H*', $device) . pack('n', strlen($payload)) . $payload;

		// Send it to the server
		$result = fwrite($fp, $msg, strlen($msg));

		// Close the connection to the server
		fclose($fp);
	}

	return $result;
}

// apple_push('9f09c872661ddcbd30ebf2504c0485a2eb151f119a35a30b072215c75076cd74', 'My first push notification!');

function push_to_name($name, $message)
{
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
		apple_push($iter["device"], $message);
	}
}

