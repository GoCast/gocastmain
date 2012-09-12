<?php
/*
 * Copyright 2012, 2012 AuditMark
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the Lesser GPL
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

/**
 *    Simple get example
 */

require_once 'jscrambler.php';

$access_key = "E1DECCE539E81D6ED49472FB4507923D45FB3AAF"; // edit
$secret_key = "4B93E569E1D942C9B4998D5BFF3BA9CD941F5EDA"; // edit

date_default_timezone_set('America/Los_Angeles');

if($argc < 2){
    echo "Try: php status.php id\n";
    echo "Example: php status.php 401c600215aab40ea4709a3a0075ef196000cdf0";
    die;
}

$jscrambler = new Jscrambler($access_key, $secret_key, 'api.jscrambler.com', '80');

// get
$result = $jscrambler->get("/code/{$argv[1]}.json");

// print
//echo $result;

$res = json_decode($result, true);
echo $res['error_id'];


