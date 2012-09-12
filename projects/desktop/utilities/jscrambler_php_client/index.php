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
 * Simple post example
 */

require_once 'jscrambler.php';

$access_key = 'YOUR_ACCESS_KEY'; //edit
$secret_key = 'YOUR_SECRET_KEY'; //edit
$path_to_project = 'PATH_TO_YOUR_PROJECT'; //edit

$jscrambler = new Jscrambler($access_key, $secret_key, 'api.jscrambler.com', 80);

$params = array('files'    => $path_to_project,
                'rename_local' =>'%DEFAULT%',
                'whitespace'   => '%DEFAULT%');

// post
$result = $jscrambler->post('/code.json', $params);

// print
echo $result;


