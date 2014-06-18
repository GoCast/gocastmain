<?php

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

function atomic_put_contents($filename, $data)
{
    $fp = fopen($filename, "w+");

	if ($fp != FALSE)
	{
		$count = 0;
		if (flock($fp, LOCK_EX))
		{
			$count = fwrite($fp, $data);
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
			$count = fwrite($fp, $data);
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
			if (filesize($filename) != 0)
			{
				$data = fread($fp, filesize($filename));
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
	if (is_file($GLOBALS['database']."/accounts.json"))
	{
		$json = atomic_get_contents($GLOBALS['database']."/accounts.json");
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
		array_push($arr, array("GET" => $GLOBALS['SGET']));
	}
	else
	{
		array_push($arr, array("POST" => $GLOBALS['SPOST']));
	}

	array_push($arr, array("result" => json_decode($result)));

	$json = json_encode($arr);

	$data = '"'.$key.'": '.$json.", \n";

	ensure_database_dir("/global/logs");

	atomic_append_contents($GLOBALS['database']."/global/logs/".$date.".txt", $data);

	print($result);
}

?>
