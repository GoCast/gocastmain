<?php
function resetPassword($name, $password, $authToken, $resetToken)
{
        $url = "resetPassword&username=$name&password=$password&authToken=$authToken&resetToken=$resetToken";
        return getCurlFail($url,"fail","ResetPassword Failed");
}
