<?php
function hasParam($x)
{
	return (isset($_GET[$x]) && !empty($_GET[$x])) || (isset($_POST[$x]) && !empty($_POST[$x]));
}
function errorMissingParameter($x)
{
	return array( "status" => "fail", "message" => "Missing parameter: $x");
}
function getCurl($url)
{
        $furl = "http://localhost:9090/plugins/userService/userservice?secret=dev.GoCast.SecretWU78zz&type=$url";
	error_log($furl);
	// create curl resource
	$ch = curl_init();
	// set url
	curl_setopt($ch, CURLOPT_URL, $furl);
	
	//return the transfer as a string
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	
	//return the transfer as a string
	curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-type: application/json", "Accept: application/json"));
	
	// $output contains the output string
	$output = curl_exec($ch);
	// close curl resource to free up system resources
	curl_close($ch);
	error_log("JSON:$output");
	return json_decode($output);
}
function getCurlFail($url, $status, $msg)
{
        $obj = getCurl($url);
	if ($obj === null)
	{
		error_log("JSON ERROR:".json_last_error());
		return array("status"=>$status,"message"=>$msg);
	}
	error_log(var_export($obj,true));
        return $obj;
}
function getCurlStatus($url, $successMsg, $failStatus, $failMsg)
{
        $obj = getCurl($url);
	if ($obj === null)
	{
		error_log("JSON ERROR:".json_last_error());
		return array("status"=>$failStatus,"message"=>$failMsg);
	}
	if ($obj->status !== "success")
	{
		error_log(var_export($obj,true));
        	$obj->message = $failMsg;
	}
	else if ($successMsg !== null)
	{
        	$obj->message = $successMsg;
	}
	return $obj;
}
function checkAuthToken($name, $authToken)
{
	$url = "authorize&username=$name&authToken=$authToken";
	return getCurlFail($url,"expired","User Not Authorized");
}
function strToHex($string)
{
    $hex = '';
    for ($i=0; $i<strlen($string); $i++){
        $ord = ord($string[$i]);
	$hex .= sprintf('%04.x', $ord);
    }
    return strToUpper($hex);
}
function hexToStr($hex)
{
    $string='';
    for ($i=0; $i < strlen($hex)-1; $i+=4){
        $string .= chr(hexdec($hex[$i].$hex[$i+1].$hex[$i+2].$hex[$i+3]));
    }
    return $string;
}
function mbstring($string)
{
    mb_internal_encoding("UTF-8"); // this IS A MUST!! PHP has trouble with multibyte
                                   // when no internal encoding is set!
    $chars = array();
    for ($i = 0; $i < mb_strlen($string); $i++ ) {
        $chars[] = mb_substr($string, $i, 1); // only one char to go to the array
    }
}
function http_response_code($statusCode)
{
	header(':', true, $statusCode);
}
