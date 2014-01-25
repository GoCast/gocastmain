<?php
// error_reporting(E_ALL);

include 'utils.php';

include 'listMessages.php';
include 'deleteMessage.php';
include 'postContent.php';
include 'postTranscription.php';

if(hasParam("action"))
{
	if ($_SERVER['REQUEST_METHOD'] === "POST")
	{
		if ($_POST["action"] === "postContent")
		{
			if (hasParam("from"))
			{
				if (hasParam("group") && is_array($_POST["group"]))
				{
					if (isset($_FILES["filename"]))
					{
						print(json_encode(postContent($_POST["from"], $_POST["group"], $_FILES["filename"]["name"])));
					}
					else
					{
						print(json_encode(errorMissingParameter("filename")));
					}
				}
				else
				{
					print(json_encode(errorMissingParameter("group")));
				}
			}
			else
			{
				print(json_encode(errorMissingParameter("from")));
			}
		}
		else if ($_POST["action"] === "postTranscription")
		{
			if (hasParam("name"))
			{
				if (isset($_FILES["filename"]))
				{
					print(json_encode(postTranscription($_POST["name"], $_FILES["filename"]["name"])));
				}
				else
				{
					print(json_encode(errorMissingParameter("filename")));
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
