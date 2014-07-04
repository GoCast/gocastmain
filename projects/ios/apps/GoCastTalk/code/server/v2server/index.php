<?php
// error_reporting(E_ALL);

$GLOBALS['invalid_input'] = false;
$GLOBALS['database'] = '/home/ec2-user/database';
$GLOBALS['pem'] = '/home/ec2-user/pem';
$GLOBALS['sh'] = '/home/ec2-user/sh';
$GLOBALS['dmode'] = 0777;
$GLOBALS['fmode'] = 0777;

$GLOBALS['SPOST']	= array();

include 'utils.php';
include 'token.php';
include 'utils-accounts.php';

include 'deviceToken.php';
include 'applePush.php';

include 'attempts.php';

include 'login.php';
include 'register.php';

include 'sendResetEmail.php';

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

include 'validUsers.php';

$GLOBALS['SPOST']	= sanitize_array($_POST);

if ($_SERVER['REQUEST_METHOD'] === "POST")
{
	if (!$GLOBALS['invalid_input'])
	{
		$device = "";
		if (hasParam("device"))
		{
			$device = $GLOBALS['SPOST']["device"];
		}

		if(hasParam("action"))
		{
			if (hasParam("authToken"))
			{
				if (hasParam("name"))
				{
					if (verify_token_user($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["authToken"]))
					{
						switch($GLOBALS['SPOST']["action"])
						{
							case "changePassword":
								if (hasParam("oldpassword"))
								{
									if (hasParam("newpassword"))
									{
										print_and_log(json_encode(changePassword($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["oldpassword"], $GLOBALS['SPOST']["newpassword"])));
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

							case "deleteMessage":
								if (hasParam("audio"))
								{
									print_and_log(json_encode(deleteMessage($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["audio"])));
								}
								else
								{
									print_and_log(json_encode(errorMissingParameter("audio")));
								}
								break;

							case "getContacts":
								print_and_log(json_encode(getContacts($GLOBALS['SPOST']["name"])));
								break;

							case "getFile":
								if (hasParam("audio"))
								{
									print_and_log(json_encode(getFile($GLOBALS['SPOST']["audio"])));
								}
								else
								{
									http_response_code(404);
									exit;
								}
								break;

							case "getGroups":
								print_and_log(json_encode(getGroups($GLOBALS['SPOST']["name"])));
								break;

							case "listMessages":
								print_and_log(json_encode(listMessages($GLOBALS['SPOST']["name"])));
								break;

							case "logout":
								if (remove_new_token($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["authToken"]))
								{
									remove_new_device($GLOBALS['SPOST']["name"], $device);

									print_and_log(json_encode(array("status" => "success", "message" => "Logout succeeded")));
								}
								else
								{
									print_and_log(json_encode(array("status" => "fail", "message" => "Could not remove token from server")));
								}
								break;

							case "markRead":
								if (hasParam("audio"))
								{
									print_and_log(json_encode(markRead($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["audio"])));
								}
								else
								{
									print_and_log(json_encode(errorMissingParameter("audio")));
								}
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

							case "registerDevice":
								add_new_device($GLOBALS['SPOST']["name"], $device);
								print_and_log(json_encode(array("status" => "success", "message" => "Register Device succeeded")));
								break;

							case "setContacts":
								print_and_log(json_encode(setContacts($GLOBALS['SPOST']["name"])));
								break;

							case "setGroups":
								print_and_log(json_encode(setGroups($GLOBALS['SPOST']["name"])));
								break;

							case "validUsers":
								print_and_log(json_encode(validUsers()));
								break;

							default:
								print_and_log(json_encode(array("status" => "fail", "message" => "Unknown command")));
								break;
						}
					}
					else
					{
						if ($GLOBALS['SPOST']["action"] === "getFile")
						{
							http_response_code(401);
							exit;
						}

						print_and_log(json_encode(errorAuthToken()));
					}
				}
				else
				{
					print_and_log(json_encode(errorMissingParameter("name")));
				}
			}
			else
			{
				if (hasParam("name"))
				{
					switch($GLOBALS['SPOST']["action"])
					{
						case "resetEmail":
							if (hasParam("lang"))
							{
								print_and_log(json_encode(sendResetEmail($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["lang"])));
							}
							else
							{
								print_and_log(json_encode(sendResetEmail($GLOBALS['SPOST']["name"], "en")));
							}
							break;

						case "verifyPin":
							if (hasParam("pin"))
							{
								print_and_log(json_encode(verifyPin($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["pin"])));
							}
							else
							{
								print_and_log(json_encode(errorMissingParameter("pin")));
							}
							break;

						case "register":
							if (hasParam("password"))
							{
								print_and_log(json_encode(register($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["password"], $device)));
							}
							else
							{
								print_and_log(json_encode(errorMissingParameter("password")));
							}
							break;

						case "login":
							if (hasParam("password"))
							{
								print_and_log(json_encode(login($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["password"], $device)));
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
									print_and_log(json_encode(changePassword($GLOBALS['SPOST']["name"], $GLOBALS['SPOST']["oldpassword"], $GLOBALS['SPOST']["newpassword"])));
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
					if ($GLOBALS['SPOST']["action"] === "version")
					{
						print_and_log('{ "status": "success", "version": "1" }');
					}
					else
					{
						print_and_log(json_encode(errorMissingParameter("name")));
					}
				}
			}
		}
		else
		{
			print_and_log(json_encode(errorMissingParameter("action")));
		}
	}
	else
	{
		print_and_log(json_encode(array("status" => "fail", "message" => "Invalid input")));
	}
}
else
{
	print_and_log(json_encode(array("status" => "fail", "message" => "Invalid request")));
}

?>
