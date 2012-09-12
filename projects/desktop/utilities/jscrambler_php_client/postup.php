<?php
  /**
   *   Simple post example
   */

require_once 'jscrambler.php';

$access_key = "E1DECCE539E81D6ED49472FB4507923D45FB3AAF"; // edit
$secret_key = "4B93E569E1D942C9B4998D5BFF3BA9CD941F5EDA"; // edit
$path_to_project = $argv[1]; // edit

date_default_timezone_set('America/Los_Angeles');


$jscrambler = new Jscrambler($access_key, $secret_key, 'api.jscrambler.com', '80');

$parameters = array('files'  => $path_to_project,
                       'rename_local' => '%DEFAULT%',
                       'whitespace' => '%DEFAULT%');
// post
// var_dump($parameters);
$result = $jscrambler->post('/code.json', $parameters);

// print
// echo $result;
$res = json_decode($result, true);
echo $res['id'];
    
