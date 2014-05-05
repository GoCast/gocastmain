<?php

function setContacts($name, $authToken)
{
    $obj = checkAuthToken($name,$authToken);
    if ($obj->status !== "success")
    {
        return $obj;
    }
    $obj = getContacts($name, $authToken);
    if ($obj->status !== "success")
    {
         return $obj;
    }
    $email = array();
    //error_log(var_export($obj,true));
    if (property_exists($obj,"contacts"))
    {
        $contacts = $obj->contacts;
       // error_log(var_export($contacts,true));
        foreach ($contacts as $item)
        {
           // error_log(var_export($item,true));
           $email[$item["email"]] = $item; 
        }
    }
    $file = $_FILES['filename']['tmp_name'];
    $jarr = json_decode(file_get_contents($file), true);
    if ($jarr == null)
    {
        return array("status" => "fail", "message" => "Could not decode $name's contacts");
    }
    foreach ($jarr as $item)
    {
        // error_log("item:".var_export($item,true));
        $type = "add_roster";
        $kana=null;
        $kanji=null;
        $current = null;
        foreach ($item as $key => $value)
        {
/*
            if (mb_check_encoding($value,"UTF-8"))
            {
                error_log("$key:UTF-8");
            }
            else if (mb_check_encoding($value,"UTF-16"))
            {
                error_log("$key:UTF-16");
            }
*/
            if ($key === "kanji")
            {
                $kanji = strToHex($value);
                error_log("KANJI:$kanji");
            }
            else if ($key === "kana")
            {
                $kana = strToHex($value);
                error_log("KANA:$kana");
            }
            else if ($key === "email")
            {
                $jid = "&item_jid=".urlencode($value);
                if (isset($email[$value]))
                {
                    $type = "update_roster";
                    $current = $email[$value];
                    unset($email[$value]);
                    //if the field is not set, should old values be kept?
                    if ($kana === null)
                    {
                        error_log("oldkana:$kana");
                        $kana = $current->kana;
                    }
                    else if ($kanji === null)
                    {
                        error_log("oldkanji:$kanji");
                        $kanji = $current->kanji;
                    }
                }
            }
        }
        $url = "$type$jid&username=$name&authToken=$authToken";
        if ($kana !== null)
        {
            $url .= "&kana=".$kana;
        }
        if ($kanji !== null)
        {
            $url .= "&kanji=".$kanji;
        }
        error_log("URL:$url");
        $obj = getCurlFail($url, "fail", "Update Contacts failed");
        if ($obj->status !== "success"){return $obj;}
    }
    //
    // delete remaining items
    //
    $type = "delete_roster";
    foreach ($email as $item)
    {
        error_log("delete item:".var_export($item,true));
        foreach ($item as $key => $value)
        {
            if ($key === "email")
            {
                $jid = "&item_jid=".urlencode($value);
                $url = "$type$jid&username=$name&authToken=$authToken";
                $obj = getCurlFail($url, "fail", "Update Contacts failed");
                if ($obj->status !== "success"){return $obj;}
            }
        }
    }
    return array("status" => "success", "message" => "Updated profile successfully");
}
