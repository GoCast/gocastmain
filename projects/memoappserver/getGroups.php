<?php
function getGroupsList($name, $authToken)
{
    $obj = getContactsJson($name, $authToken);
    if ($obj->status !== "success")
    {
        return $obj;
    }
    if (property_exists($obj,"contacts"))
    {
        $contacts =$obj->contacts;
        $ngroups = array();
        foreach ($contacts as $item)
        {
          $name = explode("group___",$item->name);
          if (count($name)>1)
          {
              $item->name = $name[1];
              $ngroups[] = $item;
              //error_log("ISGROUP:".var_export($item,true));
          }
/*
          else
          {
              error_log("NOTGROUP:".$item->name);
          }
*/
        }
        $obj->groups=$ngroups;
    }
    return $obj;
}
function getGroups($name, $authToken)
{
    $obj = getGroupsList($name, $authToken);
    if ($obj->status !== "success")
    {
        return $obj;
    }
    if (!property_exists($obj,"groups"))
    {
        return array("status" => "fail", "message" => "User does not have groups");
    }
    $maps = array();
    foreach ($obj->groups as $item)
    {
        if (property_exists($item,"groups"))
        {
            foreach($item->groups as $key => $val)
            {
                if (!isset($maps[$val]))
                {
                    $maps[$val] = "\"".$item->name."\"";
                }
                else
                {
                    $maps[$val] .= ",\"".$item->name."\"";
                }
            }
        }
    }
    $first = true;
    $jstr = "[";
    foreach ($maps as $group => $email)
    {
       $x = "{ \"emails\":[$email],\"name\":\"".hexToStr($group)."\" }";
       if ($first)
       {
          $first = false;
          $jstr .= $x;
       }
       else
       {
          $jstr .= ",".$x;
       }
    }
    $jstr .= " ]";
    //error_log("JSTR:$jstr");
    $arr = json_decode($jstr);
    return array( "status" => "success", "groups" => $arr);
}
