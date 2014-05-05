<?php
function register($name, $password, $kana, $kanji)
{
        $nickname = split("@",$name);
        $nickname=$nickname[0];
        $url = "add&username=$name&password=$password&name=$nickname";
        if ($kana !== "")
	{
           $url .= "&kana=".urlencode($kana);
        }
        if ($kanji !== "")
	{
           $url .= "&kanji=".urlencode($kanji);
        }
        return getCurlFail($url, "fail", "Register User Failed");
}
