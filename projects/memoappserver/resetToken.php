<?php
function resetToken($name, $authToken)
{
        #$url = "resetToken&username=$name&password=$password&authToken=$authToken";
        $url = "resetToken&username=$name&authToken=$authToken";
        $obj = getCurlFail($url,"fail","ResetToken Failed");
	if ($obj->status !== "success")
	{
		return $obj;
	}
	$resetToken = $obj->resetToken;
	//$name="hufftr@gmail.com";
	$results = shell_exec("./mailgun.sh $name $resetToken");
	error_log($results);
	unset($obj->resetToken);
	return $obj;
}
