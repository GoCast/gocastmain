<?php
function getContacts($name, $authToken)
{
    $obj = getContactsJson($name, $authToken);
    if ($obj->status !== "success")
    {
        return $obj;
    }
    if (property_exists($obj,"contacts"))
    {
        $contacts=$obj->contacts;
        $ncontacts = array();
        foreach ($contacts as $item)
        {
          $name = explode("contact___",$item->name);
          if (count($name)>1)
          {
              $contact = array("email"=>$name[1]);
              error_log("PROPS:".var_export($item->prop1,true));
              foreach($item->prop1 as $key => $val)
              {
                 $contact[$key]=hexToStr($val);
              }
              $ncontacts[] = $contact;
          }
          else
          {
              error_log("NOTROSTER:".$item->name);
          }
        }
        $obj->contacts=$ncontacts;
    }
    return $obj;
}
function getContactsJson($name, $authToken)
{
    $url = "get_roster&username=$name&authToken=$authToken";
    return getCurlFail($url,"fail","name invalid");
}
function validateUser($name)
{
    $url = "validate&username=$name";
    return getCurlFail($url,"fail","User does not exist");
}
