<?php
// error_reporting(E_ALL);

include 'utils.php';
include 'login.php';
include 'logout.php';
include 'register.php';
include 'listMessages.php';
include 'deleteMessage.php';

include 'getContacts.php';
include 'getGroups.php';
include 'setContacts.php';
include 'setGroups.php';
include 'markRead.php';

include 'postAudio.php';
include 'postMessage.php';
include 'postTranscription.php';
include 'getAudio.php';
include 'getFile.php';

include 'validUsers.php';
include 'changePassword.php';
include 'resetPassword.php';
include 'resetToken.php';

$this_dir = $_SERVER['REQUEST_URI'];
//if (strpos($this_dir, basename($_SERVER['REQUEST_URI'])) !== false) $this_dir = reset(explode(basename($_SERVER['REQUEST_URI']), $this_dir));
error_log($this_dir);
//error_log(var_export($_SERVER,true));
//error_log(var_export($_REQUEST,true));
if(hasParam("action"))
{
	if ($_SERVER['REQUEST_METHOD'] === "POST")
	{
		$cmd = $_POST["action"];
		if ($cmd === "setContacts")
		{
			if (hasParam("name"))
			{
				print(json_encode(setContacts(trim($_POST["name"]), $_POST["authToken"])));
			}
		}
		else if ($cmd === "setGroups")
		{
			if (hasParam("name"))
			{
				print(json_encode(setGroups(trim($_POST["name"]), $_POST["authToken"])));
			}
		}
		else if ($cmd === "postAudio")
		{
			if (hasParam("name"))
			{
				if (hasParam("audio"))
				{
					print(json_encode(postAudio(trim($_POST["name"]), $_POST["audio"], $_POST["authToken"])));
				}
				else
				{
					$msg = json_encode(errorMissingParameter("audio"));
					print($msg);
					error_log($msg);
				}
			}
			else
			{
				$msg = json_encode(errorMissingParameter("name"));
				print($msg);
				error_log($msg);
			}
		}
		else if ($cmd === "postMessage")
		{
			if (hasParam("name"))
			{
				print(json_encode(postMessage(trim($_POST["name"]), $_POST["authToken"])));
			}
			else
			{
				$msg = json_encode(errorMissingParameter("name"));
				print($msg);
				error_log($msg);
			}
		}
		else if ($cmd === "postTranscription")
		{
			if (hasParam("name"))
			{
				if (hasParam("audio"))
				{
					print(json_encode(postTranscription(trim($_POST["name"]), $_POST["audio"], $_POST["authToken"])));
				}
				else
				{
					$msg = json_encode(errorMissingParameter("audio"));
					print($msg);
					error_log($msg);
				}
			}
			else
			{
				$msg = json_encode(errorMissingParameter("name"));
				print($msg);
				error_log($msg);
			}
		}
		else if ($cmd == "validUsers")
		{
			$msg = json_encode(validUsers(trim($_POST["name"]), $_POST["authToken"]));
			print($msg);
			error_log($msg);
		}
		else
		{
			$msg = json_encode(array("status" => "fail", "message" => "Unknown command:$cmd"));
			print($msg);
			error_log($msg);
		}
	}
	else if (hasParam("name"))
	{
		$cmd = $_GET["action"];
		switch($cmd)
		{
			case "register":
				if (hasParam("password"))
				{
					print(json_encode(register(trim($_GET["name"]), $_GET["password"], $_GET["kana"], $_GET["kanji"])));
				}
				else
				{
					$msg = json_encode(errorMissingParameter("password"));
					print($msg);
					error_log($msg);
				}
				break;

			case "login":
				if (hasParam("password"))
				{
					print(json_encode(login(trim($_GET["name"]), $_GET["password"])));
				}
				else
				{
					$msg = json_encode(errorMissingParameter("password"));
					print($msg);
					error_log($msg);
				}
				break;
			case "logout":
				if (hasParam("authToken"))
				{
					print(json_encode(logout(trim($_GET["name"]), $_GET["authToken"])));
				}
				else
				{
					$msg = json_encode(errorMissingParameter("authToken"));
					print($msg);
					error_log($msg);
				}
				break;
			case "changePassword":
				if (hasParam("newpassword"))
				{
					print(json_encode(changePassword(trim($_GET["name"]), $_GET["newpassword"], $_GET["oldpassword"],  $_GET["authToken"])));
				}
				else
				{
					$msg = json_encode(errorMissingParameter("newpassword"));
					print($msg);
					error_log($msg);
				}
				break;

			case "resetPassword":
				if (hasParam("password"))
				{
					print(json_encode(resetPassword(trim($_GET["name"]), $_GET["password"], $_GET["authToken"], $_GET["resetToken"])));
				}
				else
				{
					$msg = json_encode(errorMissingParameter("password"));
					print($msg);
					error_log($msg);
				}
				break;
			case "resetToken":
				if (hasParam("name"))
				{
					print(json_encode(resetToken(trim($_GET["name"]), $_GET["authToken"])));
				}
				else
				{
					$msg = json_encode(errorMissingParameter("name"));
					print($msg);
					error_log($msg);
				}
				break;

			case "getContacts":
				print(json_encode(getContacts(trim($_GET["name"]), $_GET["authToken"], false)));
				break;

			case "getGroups":
				print(json_encode(getGroups(trim($_GET["name"]), $_GET["authToken"])));
				break;

			case "listMessages":
				print(json_encode(listMessages(trim($_GET["name"]), $_GET["authToken"])));
				break;

			case "deleteMessage":
				if (hasParam("audio"))
				{
					print(json_encode(deleteMessage(trim($_GET["name"]), $_GET["audio"], $_GET["authToken"])));
				}
				else
				{
					$msg = json_encode(errorMissingParameter("audio"));
					print($msg);
					error_log($msg);
				}
				break;
			case "getAudio":
				if (hasParam("audio"))
				{
					$arr = getAudio(trim($_GET["name"]), $_GET["audio"], $_GET["authToken"]);
					if ($arr["status"] !== "success")
					{
						print(json_encode($arr));
					}
				}
				else
				{
					$msg = json_encode(errorMissingParameter("audio"));
					print($msg);
					error_log($msg);
				}
				break;
			case "getFile":
				if (hasParam("audio"))
				{
					$arr = getFile(trim($_GET["name"]), $_GET["audio"], $_GET["authToken"]);
					if ($arr["status"] !== "success")
					{
						print(json_encode($arr));
					}
				}
				else
				{
					$msg = json_encode(errorMissingParameter("audio"));
					print($msg);
					error_log($msg);
				}
				break;

			case "markRead":
				if (hasParam("audio"))
				{
					print(json_encode(markRead(trim($_GET["name"]), $_GET["audio"], $_GET["authToken"])));
				}
				else
				{
					print(json_encode(errorMissingParameter("audio")));
				}
				break;

			default:
				$msg = json_encode(array("status" => "fail", "message" => "Unknown command:$cmd"));
				print($msg);
				error_log($msg);
				break;
		}
	}
	else if ($_GET["action"] === "version")
	{
		print('{ "status": "success", "version": "1" }');
	}
	else if ($_GET["action"] === "config")
	{
		print('{ "status": "success", "config":{"version":"1", "url": https://chat.gocast.it/memoappserver/" }}');
	}
	else
	{
		$msg= json_encode(errorMissingParameter("name"));
		print($msg);
		error_log($msg);
	}
}
else
{
	$msg = json_encode(errorMissingParameter("action"));
	print($msg);
	error_log($msg);
}
