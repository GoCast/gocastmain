<?php

function add_new_token($name)
{
	return bin2hex(openssl_random_pseudo_bytes(32));
}

?>
