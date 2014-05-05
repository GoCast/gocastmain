<?php
function getAudio($name, $message, $authToken)
{
	$obj = checkAuthToken($name, $authToken);
	if ($obj->status != "success")
	{
		//return array("status"=>$obj->status,"message"=>$obj->message);
		http_response_code(401);
	}
	else
	{
		$result = getMessageFile($name, $message);
		if ($result["status"] === "success")
		{
			$file = $result["file"];
			//header('Content-Type: application/octet-stream');
			//header('Content-Disposition: attachment; filename='.basename($path));
			header('Expires: 0');
			header('Cache-Control: must-revalidate');
			header('Pragma: public');
			header('Content-Length: '.filesize($file));
	        	header("Content-type:".GetMIMEtype($file));
			http_response_code(200);
			print file_get_contents($file);
		}
		else
		{
			http_response_code(404);
		}
	}
	exit;
}
function getMessageFile($name, $message)
{
	$status = getMessagesJson($name);
	if (empty($status["json"]))
	{
		return $status;
	}
	$arr = json_decode($status["json"], true);
	$file = null;
	foreach($arr as $item)
	{
		if (!isset($item["audio"]))
		{
			continue;
		}
		if ($item["audio"] === $message)
		{
			$file = "./database/global/audio/$message";
			break;
		}
	}
	return array("status"=>"success", "file"=>$file);
}
function GetMIMEtype($filename) {
	$filename = realpath($filename);
/*
	if (!file_exists($filename)) {
		echo 'File does not exist: "'.htmlentities($filename).'"<br>';
		return '';
	} elseif (!is_readable($filename)) {
		echo 'File is not readable: "'.htmlentities($filename).'"<br>';
		return '';
	}
*/
	// include getID3() library (can be in a different directory if full path is specified)
	require_once('./getid3/getid3.php');
	// Initialize getID3 engine
	$getID3 = new getID3;

	$DeterminedMIMEtype = '';
	if ($fp = fopen($filename, 'rb')) {
		$getID3->openfile($filename);
		if (empty($getID3->info['error'])) {

			// ID3v2 is the only tag format that might be prepended in front of files, and it's non-trivial to skip, easier just to parse it and know where to skip to
			getid3_lib::IncludeDependency(GETID3_INCLUDEPATH.'module.tag.id3v2.php', __FILE__, true);
			$getid3_id3v2 = new getid3_id3v2($getID3);
			$getid3_id3v2->Analyze();

			fseek($fp, $getID3->info['avdataoffset'], SEEK_SET);
			$formattest = fread($fp, 16);  // 16 bytes is sufficient for any format except ISO CD-image
			fclose($fp);

			$DeterminedFormatInfo = $getID3->GetFileFormat($formattest);
			$DeterminedMIMEtype = $DeterminedFormatInfo['mime_type'];
/*
		} else {
			echo 'Failed to getID3->openfile "'.htmlentities($filename).'"<br>';
*/
		}
/*
	} else {
		echo 'Failed to fopen "'.htmlentities($filename).'"<br>';
*/
	}
	return $DeterminedMIMEtype;
}
