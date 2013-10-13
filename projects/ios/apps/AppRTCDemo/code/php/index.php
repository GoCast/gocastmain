<?php
// error_reporting(E_ALL);

include 'listInbox.php';
include 'getFile.php';
include 'deleteFile.php';
include 'login.php';
include 'changePassword.php';
include 'register.php';
include 'versionRequired.php';

	function hasParam($x)
	{
		if(isset($_GET[$x]) && !empty($_GET[$x]))
		{
			return true;
		}

		return false;
	}

	function errorMissingParameter($x)
	{
		return array(	"status" => "fail",
						"message" => "Missing parameter: $x");
	}

	if(hasParam("action"))
	{
		if ($_GET["action"] === "versionRequired")
		{
			print(json_encode(versionRequired()));
		}
		else if (hasParam("name"))
		{
			switch($_GET["action"])
			{
				case "listInbox":
					print(json_encode(listInbox($_GET["name"])));
					break;
				case "getFile":
					if (hasParam("file"))
					{
						print(json_encode(getFile($_GET["name"], $_GET["file"])));
					}
					else
					{
						print(json_encode(errorMissingParameter("file")));
					}
					break;
				case "deleteFile":
					if (hasParam("file"))
					{
						print(json_encode(deleteFile($_GET["name"], $_GET["file"])));
					}
					else
					{
						print(json_encode(errorMissingParameter("file")));
					}
					break;
				case "login":
					if (hasParam("password"))
					{
						print(json_encode(login($_GET["name"], $_GET["password"])));
					}
					else
					{
						print(json_encode(errorMissingParameter("password")));
					}
					break;
				case "changePassword":
					if (hasParam("password"))
					{
						if (hasParam("newpassword"))
						{
							print(json_encode(changePassword($_GET["name"], $_GET["password"], $_GET["newpassword"])));
						}
						else
						{
							print(json_encode(errorMissingParameter("newpassword")));
						}
					}
					else
					{
						print(json_encode(errorMissingParameter("password")));
					}
					break;
				case "register":
					if (hasParam("password"))
					{
						print(json_encode(register($_GET["name"], $_GET["password"])));
					}
					else
					{
						print(json_encode(errorMissingParameter("password")));
					}
					break;
				case "postGroup":
					print(json_encode(array("status" => "fail", "message" => "unimplemented")));
					break;
				default:
					print(json_encode(array("status" => "fail", "message" => "Unknown command")));
					break;
			}
		}
		else
		{
			print(json_encode(errorMissingParameter("name")));
		}
	}
	else
	{
		print(json_encode(errorMissingParameter("action")));
	}
?>
