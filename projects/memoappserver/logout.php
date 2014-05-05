<?php
function logout($name, $authToken)
{
        return getCurlStatus("logout&username=$name&authToken=$authToken","Logout success","fail","Logout failure");
}
