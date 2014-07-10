<?php

function timestamp_to_readabletime($t1)
{
	date_default_timezone_set("UTC");

	$date = date("Ymd", $t1);
	$t2  = $date.date("Hi", $t1);

	return $t2;
}

function readabletime_to_timestamp($t1)
{
	date_default_timezone_set("UTC");

	$time	= time();

	$year	= substr($t1, 0, 4);
	$month	= substr($t1, 4, 2);
	$day	= substr($t1, 6, 2);
	$hour	= substr($t1, 8, 2);
	$min	= substr($t1, 10, 2);

	return strtotime("$month/$day/$year $hour:$min:00" , $time);
}

function has_thirty_minutes_passed($t1, $t2)
{
	return abs(readabletime_to_timestamp($t1) - readabletime_to_timestamp($t2)) >= 30*60;
}

function has_two_weeks_passed($t1, $t2)
{
	return false;
// 	return abs(readabletime_to_timestamp($t1) - readabletime_to_timestamp($t2)) >= 14*24*60*60;
}

// echo (has_two_weeks_passed("201401010534", "201401150534")) ? "true\n" : "false\n";

function ensure_database_dir($dir)
{
	if (!is_dir($GLOBALS['database'].$dir))
	{
		mkdir($GLOBALS['database'].$dir, $GLOBALS['dmode'], true);
	}
}

function get_file_size($file)
{
	$result = 0;

	if (is_file($file))
	{
		$result = filesize($file);
	}
	
	return $result;
}

function sanitize_array( array $array )
{
	$result = array();

	foreach( $array as $key => $val )
	{
		if( is_array( $val ) )
		{
			$result[$key] = sanitize_array( $val );
		}
		else if ( is_object( $val ) )
		{
			$result[$key] = clone $val;
		}
		else
		{
			$sanitized = filter_var($val, FILTER_SANITIZE_SPECIAL_CHARS, FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH);

			if ($sanitized === $val)
			{
				$result[$key] = $sanitized;
			}
			else
			{
				$GLOBALS['invalid_input'] = true;
			}
		}
	}
	return $result;
}

function remove_password( array $array )
{
	$result = array();

	foreach( $array as $key => $val )
	{
		if( is_array( $val ) )
		{
			$result[$key] = remove_password( $val );
		}
		else if ( is_object( $val ) )
		{
			$result[$key] = clone $val;
		}
		else
		{
			switch ($key)
			{
				case "password":
				case "newpassword":
				case "oldpassword":
					$result[$key] = "N.A.";
					break;

				default:
					$result[$key] = $val;
					break;
			}
		}
	}
	return $result;
}

function atomic_put_contents($filename, $data)
{
    $fp = fopen($filename, "w+");

	if ($fp != FALSE)
	{
		$count = 0;
		if (flock($fp, LOCK_EX))
		{
			$count = file_put_contents($filename, $data);
			flock($fp, LOCK_UN);
		}
		fclose($fp);

		return $count;
	}
	
	return FALSE;
}

function atomic_gzput_contents($filename, $data)
{
    $fp = gzopen($filename, "wb");

	if ($fp != FALSE)
	{
		$count = gzwrite($fp, $data);

		gzclose($fp);

		return $count;
	}
	
	return FALSE;
}

function atomic_append_contents($filename, $data)
{
    $fp = fopen($filename, "a+");

	if ($fp != FALSE)
	{
		$count = 0;
		if (flock($fp, LOCK_EX))
		{
			$predata = file_get_contents($filename);
			if ($predata)
			{
				$count = file_put_contents($filename, $predata.$data);
			}
			else
			{
				$count = file_put_contents($filename, $data);
			}
			flock($fp, LOCK_UN);
		}
		fclose($fp);

		return $count;
	}
	
	return FALSE;
}

function atomic_get_contents($filename)
{
    $fp = fopen($filename, "r+");

	if ($fp != FALSE)
	{
		$data = "";

		if (flock($fp, LOCK_EX))
		{
			$size = filesize($filename);
			if ($size != 0)
			{
				$data = file_get_contents($filename);
			}
			flock($fp, LOCK_UN);
		}
		fclose($fp);

		return $data;
	}

	return FALSE;
}

function userExists($name)
{
	if (is_file($GLOBALS['database']."/accounts-hashed.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/accounts-hashed.json");
		$arr = json_decode($json, true);

		if(isset($arr[$name]) && !empty($arr[$name]))
		{
			return true;
		}
	}

	return false;
}

function isntEmpty($x)
{
	if(isset($x) && !empty($x) && !is_null($x))
	{
		return true;
	}
	
	return false;
}

function hasParam($x)
{
	if( isntEmpty($GLOBALS['SGET'][$x]) || isntEmpty($GLOBALS['SPOST'][$x]) )
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

function errorAuthToken()
{
	return array(	"status" => "expired",
					"message" => "Invalid or expired token");
}

function udate()
{
	$utimestamp = microtime(true);

	$timestamp = floor($utimestamp);
	$milliseconds = round(($utimestamp - $timestamp) * 100);

	if (strlen($milliseconds) == 1)
	{
		$milliseconds = '0'.$milliseconds;
	}

	return $milliseconds;
}

function gzip_file($file)
{
	atomic_gzput_contents($file.'.gz', atomic_get_contents($file));

	@unlink($file);
	@unlink($file.".lock");
}

function check_roll_yesterday($time)
{
	date_default_timezone_set("UTC");

	$date = date("Ymd", $time - 60 * 60 * 24);

	if (is_file($GLOBALS['database']."/global/logs/".$date.".txt"))
	{
		if (!is_file($GLOBALS['database']."/global/logs/".$date.".txt.lock"))
		{
			atomic_put_contents($GLOBALS['database']."/global/logs/".$date.".txt.lock", "lock");
			gzip_file($GLOBALS['database']."/global/logs/".$date.".txt");
		}
	}
}

function print_and_log($result)
{
	date_default_timezone_set("UTC");

	$time = time();
	$date = date("Ymd", $time);
	$key  = $date.date("His").udate();
	check_roll_yesterday($time);

	$arr = array();
	
	array_push($arr, array("ip" => $_SERVER['REMOTE_ADDR']));

	if ($_SERVER['REQUEST_METHOD'] === "GET")
	{
		array_push($arr, array("GET" => remove_password($GLOBALS['SGET'])));
	}
	else
	{
		array_push($arr, array("POST" => remove_password($GLOBALS['SPOST'])));
	}

	array_push($arr, array("result" => json_decode($result)));

	$json = json_encode($arr);

	$data = '"'.$key.'": '.$json.", \n";

	ensure_database_dir("/global/logs");

	atomic_append_contents($GLOBALS['database']."/global/logs/".$date.".txt", $data);

	print($result);
}

?>
