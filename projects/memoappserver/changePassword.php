<?php
function changePassword($name, $password, $oldPassword, $authToken)
{
        $url = "changePassword&username=$name&password=$password&oldPassword=$oldPassword&authToken=$authToken";
        return getCurlFail($url,"fail","ChangePassword Failed");
}
