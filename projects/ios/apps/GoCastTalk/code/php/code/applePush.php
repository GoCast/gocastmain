<?php

function apple_push($device, $message, $pem)
{
// 	echo "push to $device '$message'\n";

	$result = false;

	$passphrase = 'abc123';

	$ctx = stream_context_create();
	stream_context_set_option($ctx, 'ssl', 'local_cert', $pem);
	stream_context_set_option($ctx, 'ssl', 'passphrase', $passphrase);

	// Open a connection to the APNS server
	$fp = stream_socket_client(
		'ssl://gateway.push.apple.com:2195', $err,
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
		apple_push($iter["device"], $message, 'pem/applePush.pem');
		apple_push($iter["device"], $message, 'pem/applePushEn.pem');
	}
}

// apple_push('4869fddfb2f9ad7c6137d433043f3e345828726598d8ed8f924cf063ba15b619', 'My first push notification!', 'pem/applePush.pem');
// push_to_name('tjgrant@tatewake.com', 'abc123');
