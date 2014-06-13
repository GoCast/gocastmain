<?php
// error_reporting(E_ALL);

$GLOBALS['database'] = 'database';

$GLOBALS['SGET']	= array();
$GLOBALS['SPOST']	= array();

include 'code/utils.php';
include 'code/token.php';

include 'code/deviceToken.php';
include 'code/applePush.php';

include 'code/login.php';
include 'code/register.php';

include 'code/sendResetEmail.php';

include 'code/changePassword.php';

include 'code/listMessages.php';
include 'code/deleteMessage.php';
include 'code/markRead.php';

include 'code/getContacts.php';
include 'code/setContacts.php';

include 'code/getGroups.php';
include 'code/setGroups.php';

include 'code/getFile.php';

include 'code/postAudio.php';
include 'code/postMessage.php';
include 'code/postTranscription.php';

include 'code/validUsers.php';

$GLOBALS['SGET']	= sanitize_array($_GET);
$GLOBALS['SPOST']	= sanitize_array($_POST);

$device = "";
if (hasParam("device"))
{
	$device = $GLOBALS['SGET']["device"];
}

if(hasParam("action"))
{
	if (hasParam("authToken"))
	{
		if (hasParam("name"))
		{
			if ($_SERVER['REQUEST_METHOD'] === "POST")
			{
				if (verify_token_user($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["authToken"]))
				{
					switch($GLOBALS['SPOST']["action"])
					{
						case "validUsers":
							print_and_log(json_encode(validUsers()));
							break;

						case "setContacts":
							print_and_log(json_encode(setContacts($GLOBALS['SPOST']["name"])));
							break;

						case "setGroups":
							print_and_log(json_encode(setGroups($GLOBALS['SPOST']["name"])));
							break;

						case "postAudio":
							if (hasParam("audio"))
							{
								print_and_log(json_encode(postAudio($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["audio"])));
							}
							else
							{
								print_and_log(json_encode(errorMissingParameter("audio")));
							}
							break;

						case "postMessage":
							print_and_log(json_encode(postMessage($GLOBALS['SPOST']["name"])));
							break;

						case "postTranscription":
							if (hasParam("audio"))
							{
								print_and_log(json_encode(postTranscription($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["audio"])));
							}
							else
							{
								print_and_log(json_encode(errorMissingParameter("audio")));
							}
							break;

						default:
							print_and_log(json_encode(array("status" => "fail", "message" => "Unknown command")));
							break;
					}
				}
				else
				{
					print_and_log(json_encode(errorAuthToken()));
				}
			}
			else
			{
				if (verify_token_user($GLOBALS['SGET']["name"], $GLOBALS['SGET']["authToken"]))
				{
					switch($GLOBALS['SGET']["action"])
					{
						case "getFile":
							if (hasParam("audio"))
							{
								print_and_log(json_encode(getFile($GLOBALS['SGET']["audio"])));
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
									print_and_log(json_encode(changePassword($GLOBALS['SGET']["name"], $GLOBALS['SGET']["oldpassword"], $GLOBALS['SGET']["newpassword"])));
								}
								else
								{
									print_and_log(json_encode(errorMissingParameter("newpassword")));
								}
							}
							else
							{
								print_and_log(json_encode(errorMissingParameter("oldpassword")));
							}
							break;

						case "registerDevice":
							add_new_device($GLOBALS['SGET']["name"], $device);
							print_and_log(json_encode(array("status" => "success", "message" => "Register Device succeeded")));
							break;

						case "logout":
							if (remove_new_token($GLOBALS['SGET']["name"], $GLOBALS['SGET']["authToken"]))
							{
								remove_new_device($GLOBALS['SGET']["name"], $device);

								print_and_log(json_encode(array("status" => "success", "message" => "Logout succeeded")));
							}
							else
							{
								print_and_log(json_encode(array("status" => "fail", "message" => "Could not remove token from server")));
							}
							break;

						case "getContacts":
							print_and_log(json_encode(getContacts($GLOBALS['SGET']["name"])));
							break;

						case "getGroups":
							print_and_log(json_encode(getGroups($GLOBALS['SGET']["name"])));
							break;

						case "listMessages":
							print_and_log(json_encode(listMessages($GLOBALS['SGET']["name"])));
							break;

						case "deleteMessage":
							if (hasParam("audio"))
							{
								print_and_log(json_encode(deleteMessage($GLOBALS['SGET']["name"], $GLOBALS['SGET']["audio"])));
							}
							else
							{
								print_and_log(json_encode(errorMissingParameter("audio")));
							}
							break;

						case "markRead":
							if (hasParam("audio"))
							{
								print_and_log(json_encode(markRead($GLOBALS['SGET']["name"], $GLOBALS['SGET']["audio"])));
							}
							else
							{
								print_and_log(json_encode(errorMissingParameter("audio")));
							}
							break;

						default:
							print_and_log(json_encode(array("status" => "fail", "message" => "Unknown command")));
							break;
					}
				}
				else
				{
					if ($GLOBALS['SGET']["action"] === "getFile")
					{
						http_response_code(401);
						exit;
					}

					print_and_log(json_encode(errorAuthToken()));
				}
			}
		}
		else
		{
			print_and_log(json_encode(errorMissingParameter("name")));
		}
	}
	else
	{
		if ($_SERVER['REQUEST_METHOD'] === "GET")
		{
			if (hasParam("name"))
			{
				switch($GLOBALS['SGET']["action"])
				{
					case "resetEmail":
						if (hasParam("lang"))
						{
							print_and_log(json_encode(sendResetEmail($GLOBALS['SGET']["name"], $GLOBALS['SGET']["lang"])));
						}
						else
						{
							print_and_log(json_encode(sendResetEmail($GLOBALS['SGET']["name"], "en")));
						}
						break;

					case "verifyPin":
						if (hasParam("pin"))
						{
							print_and_log(json_encode(verifyPin($GLOBALS['SGET']["name"], $GLOBALS['SGET']["pin"])));
						}
						else
						{
							print_and_log(json_encode(errorMissingParameter("pin")));
						}
						break;

					case "register":
						if (hasParam("password"))
						{
							print_and_log(json_encode(register($GLOBALS['SGET']["name"], $GLOBALS['SGET']["password"], $device)));
						}
						else
						{
							print_and_log(json_encode(errorMissingParameter("password")));
						}
						break;

					case "login":
						if (hasParam("password"))
						{
							print_and_log(json_encode(login($GLOBALS['SGET']["name"], $GLOBALS['SGET']["password"], $device)));
						}
						else
						{
							print_and_log(json_encode(errorMissingParameter("password")));
						}
						break;

					case "changePassword":
						if (hasParam("oldpassword"))
						{
							if (hasParam("newpassword"))
							{
								print_and_log(json_encode(changePassword($GLOBALS['SGET']["name"], $GLOBALS['SGET']["oldpassword"], $GLOBALS['SGET']["newpassword"])));
							}
							else
							{
								print_and_log(json_encode(errorMissingParameter("newpassword")));
							}
						}
						else
						{
							print_and_log(json_encode(errorMissingParameter("oldpassword")));
						}
						break;

					default:
						print_and_log(json_encode(array("status" => "fail", "message" => "Unknown command")));
						break;
				}
			}
			else
			{
				if ($GLOBALS['SGET']["action"] === "version")
				{
					print_and_log('{ "status": "success", "version": "1" }');
				}
				else
				{
					print_and_log(json_encode(errorMissingParameter("name")));
				}
			}
		}
		else
		{
			print_and_log(json_encode(errorMissingParameter("name")));
		}
	}
}
else
{
	print_and_log(json_encode(errorMissingParameter("action")));
}
?>
