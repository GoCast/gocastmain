<?php
function setGroups($name, $authToken)
{
    $obj = checkAuthToken($name, $authToken);
    if ($obj->status !== "success")
    {
        return $obj;
    }
    $obj = getGroupsList($name, $authToken);
    if ($obj->status !== "success")
    {
        return $obj;
    }
    $email = array();
    // error_log(var_export($obj,true));
    if (property_exists($obj,"groups"))
    {
        foreach ($obj->groups as $item)
        {
           error_log("ITEM:".var_export($item,true));
           $email[$item->name] = $item; 
        }
    }
    $file = $_FILES['filename']['tmp_name'];
    $jarr = json_decode(file_get_contents($file), true);
    if ($jarr == null)
    {
        return array("status" => "fail", "message" => "Could not decode $name's groups");
    }
    $maps = array();
    //error_log("FILE:".var_export($jarr,true));
    foreach ($jarr as $key => $item)
    {
        $emails = array();
        foreach ($item as $nkey => $list)
        {
            if ($nkey === "emails")
            {
                foreach ($list as $ekey => $value)
                {
                    //$emails[] = strToHex($value);
                    $emails[] = $value;
                }
            }
            else if ($nkey === "name")
            {
                //$group = urlencode($list);
                //$group = $list;
                $group = strToHex($list);
                foreach ($emails as $contact)
                {
                    if (isset($maps[$contact]))
                    {
                        $maps[$contact] .= ",".$group;
                    }
                    else
                    {
                        $maps[$contact] = $group;
                    }
                    error_log("groups:".$maps[$contact]);
                }
            }
        }
    }
    foreach ($maps as $contact => $groups)
    {
        if (isset($email[$contact]))
        {
            $type = "update_groups";
            unset($email[$contact]); 
        }
        else
        {
            $type = "add_groups"; 
        }
        $url = "$type&username=$name&authToken=$authToken&groups=".urlencode($groups)."&item_jid=".urlencode($contact);
        $obj = getCurlFail($url, "fail", "Group update failed");
        if ($obj->status != "success") return $obj;
    }
    //
    // delete remaining items
    //
    foreach ($email as $item)
    {
        error_log("delete item:".var_export($item,true));
        $type = "delete_roster";
        $isgroup = true;
        $jid = null;
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
    return array("status" => "success", "message" => "Updated groups successfully");
}
