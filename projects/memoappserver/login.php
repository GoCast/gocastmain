<?php
function login($name, $password)
{
	return getCurlStatus("login&username=$name&password=$password","Login was successful","fail","Login failed");
}
