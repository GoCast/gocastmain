<?php
function getFile($name, $file, $authToken)
{
	if (!checkAudioFile($name, $file, $authToken))
	{
		http_response_code(404);
		exit;
	}
	$path = "database/global/audio/$file";
	if (is_file($path))
	{
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename='.basename($path));
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($path));
		if (ob_get_contents())
		{
			ob_end_clean();
		}
		flush();
		readfile($path);
		exit;
	}
	else
	{
		http_response_code(404);
		exit;
	}
	return "";
}
function checkAudioFile($name, $file, $authToken)
{
	if (strcmp($file,"welcome-feedback@gocast.it") === 0)
	{
		return true;
	}
	$obj = checkAuthToken($name, $authToken);
	if ($obj->status != "success")
	{
		// return array("status"=>$obj->status,"message"=>$obj->message);
		http_response_code(401);
		exit;
		return false;
	}
	$status = getMessagesJson($name);
	if (empty($status["json"]))
	{
		http_response_code(404);
		exit;
		return false;
	}
	$arr = json_decode($status["json"], true);

	foreach($arr as $item)
	{
		if (strcmp($item["audio"], $file) === 0)
		{
			return true;
		}
	}
	return false;
}
