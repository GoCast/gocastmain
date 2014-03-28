<?php
// error_reporting(E_ALL);

include 'utils.php';
include 'token.php';

include 'login.php';
include 'register.php';
include 'changePassword.php';

include 'listMessages.php';
include 'deleteMessage.php';
include 'markRead.php';

include 'getContacts.php';
include 'setContacts.php';

include 'getGroups.php';
include 'setGroups.php';

include 'getFile.php';

include 'postAudio.php';
include 'postMessage.php';
include 'postTranscription.php';

if(hasParam("action"))
{
	if (hasParam("authToken"))
	{
		if (hasParam("name"))
		{
			if ($_SERVER['REQUEST_METHOD'] === "POST")
			{
				if (verify_token_user($_POST["name"], $_POST["authToken"]))
				{
					switch($_POST["action"])
					{
						case "setContacts":
							print(json_encode(setContacts($_POST["name"])));
							break;

						case "setGroups":
							print(json_encode(setGroups($_POST["name"])));
							break;

						case "postAudio":
							if (hasParam("audio"))
							{
								print(json_encode(postAudio($_POST["name"], $_POST["audio"])));
							}
							else
							{
								print(json_encode(errorMissingParameter("audio")));
							}
							break;

						case "postMessage":
							print(json_encode(postMessage($_POST["name"])));
							break;

						case "postTranscription":
							if (hasParam("audio"))
							{
								print(json_encode(postTranscription($_POST["name"], $_POST["audio"])));
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
					print(json_encode(errorAuthToken()));
				}
			}
			else
			{
				if (verify_token_user($_GET["name"], $_GET["authToken"]))
				{
					switch($_GET["action"])
					{
						case "getFile":
							if (hasParam("audio"))
							{
								print(json_encode(getFile($_GET["audio"])));
							}
							else
							{
								http_response_code(404);
								exit;
							}
							break;

						case "changePassword":
							if (hasParam("oldpassword"))
							{
								if (hasParam("newpassword"))
								{
									print(json_encode(changePassword($_GET["name"], $_GET["oldpassword"], $_GET["newpassword"])));
								}
								else
								{
									print(json_encode(errorMissingParameter("newpassword")));
								}
							}
							else
							{
								print(json_encode(errorMissingParameter("oldpassword")));
							}
							break;

						case "logout":
							if (remove_new_token($_GET["name"], $_GET["authToken"]))
							{
								print(json_encode(array("status" => "success", "message" => "Logout succeeded")));
							}
							else
							{
								print(json_encode(array("status" => "fail", "message" => "Could not remove token from server")));
							}
							break;

						case "getContacts":
							print(json_encode(getContacts($_GET["name"])));
							break;

						case "getGroups":
							print(json_encode(getGroups($_GET["name"])));
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

						case "markRead":
							if (hasParam("audio"))
							{
								print(json_encode(markRead($_GET["name"], $_GET["audio"])));
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
					if ($_GET["action"] === "getFile")
					{
						http_response_code(401);
						exit;
					}

					print(json_encode(errorAuthToken()));
				}
			}
		}
		else
		{
			print(json_encode(errorMissingParameter("name")));
		}
	}
	else
	{
		if ($_SERVER['REQUEST_METHOD'] === "GET" && hasParam("name"))
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
}
else
{
	print(json_encode(errorMissingParameter("action")));
}
?>
