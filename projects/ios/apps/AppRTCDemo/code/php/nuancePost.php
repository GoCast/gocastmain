<?php

function nuancePost($filename)
{
	$json = false;

	if (is_file("database/transcriptions/$filename.json"))
	{
		$json = file_get_contents("database/transcriptions/$filename.json");
	}

	if ($json != false)
	{
		$arr = json_decode($json, true);
	}
	else
	{
		$json = "";
		$arr = array();
	}

	$ch = curl_init(); 
	
	$post = array('extra_info' => '123456','file_contents'=>'@'.'database/audiocache/'.$filename);

	// set url 
	curl_setopt($ch, CURLOPT_URL, "https://dictation.nuancemobility.net:443/NMDPAsrCmdServlet/dictation?appId=NMDPTRIAL_hmizusawa20131113014320&appKey=e14ef3807d6ac269bda9d4c12edfcf0e97d3077a3341d3b0f8776f167980495acf3cdb4ca69db5644689257569f48300c88b7afbcc4dabc4c41ada3d9b23986a&id=$filename"); 

	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
												'Content-Type: audio/x-wav;codec=pcm;bit=16;rate=16000',
												'Accept-Language: ja_jp',
												'Transfer-Encoding: chunked',
												'Accept: application/xml',
												'Accept-Topic: Dictation'));

	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

	//return the transfer as a string 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

	// $output contains the output string 
	$output = curl_exec($ch);
	$arr['ja2'] = $output;

	// close curl resource to free up system resources 
	curl_close($ch);      

	if (file_put_contents("database/transcriptions/$filename.json", json_encode($arr)) != false)
	{
		chmod("database/transcriptions/$filename.json", 0777);

		$result = array("status" => "success",
						"message" => "Wrote to $filename.json successfully");
	}
	else
	{
		$result = array("status" => "fail",
						"message" => "Could not write to $filename.json");
	}

	return $result;
}

?>
