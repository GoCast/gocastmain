<?php
// error_reporting(E_ALL);

include 'utils.php';

include 'login.php';
include 'register.php';
include 'listMessages.php';
include 'deleteMessage.php';

include 'getContacts.php';
include 'setContacts.php';

include 'postAudio.php';
include 'postMessage.php';
include 'postTranscription.php';

if(hasParam("action"))
{
	if ($_SERVER['REQUEST_METHOD'] === "POST")
	{
		if ($_POST["action"] === "setContacts")
		{
			if (hasParam("name"))
			{
				print(json_encode(setContacts($_POST["name"])));
			}
		}
		else if ($_POST["action"] === "postAudio")
		{
			if (hasParam("name"))
			{
				if (hasParam("audio"))
				{
					print(json_encode(postAudio($_POST["name"], $_POST["audio"])));
				}
				else
				{
					print(json_encode(errorMissingParameter("audio")));
				}
			}
			else
			{
				print(json_encode(errorMissingParameter("name")));
			}
		}
		else if ($_POST["action"] === "postMessage")
		{
			if (hasParam("name"))
			{
				print(json_encode(postMessage($_POST["name"])));
			}
			else
			{
				print(json_encode(errorMissingParameter("name")));
			}
		}
		else if ($_POST["action"] === "postTranscription")
		{
			if (hasParam("name"))
			{
				if (hasParam("audio"))
				{
					print(json_encode(postTranscription($_POST["name"], $_POST["audio"])));
				}
				else
				{
					print(json_encode(errorMissingParameter("audio")));
				}
			}
			else
			{
				print(json_encode(errorMissingParameter("name")));
			}
		}
		else
		{
			print(json_encode(array("status" => "fail", "message" => "Unknown command")));
		}
	}
	else if (hasParam("name"))
	{
		switch($_GET["action"])
		{
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

			case "getContacts":
				print(json_encode(getContacts($_GET["name"])));
				break;

			case "listMessages":
				print(json_encode(listMessages($_GET["name"])));
				break;

			case "deleteMessage":
				if (hasParam("audio"))
				{
					print(json_encode(deleteMessage($_GET["name"], $_GET["audio"])));
				}
				else
				{
					print(json_encode(errorMissingParameter("audio")));
				}
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
