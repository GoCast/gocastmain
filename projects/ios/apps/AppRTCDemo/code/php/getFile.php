<?php

function getFile($file)
{
	if (is_file("database/global/audio/$file"))
	{
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename='.basename("database/global/audio/$file"));
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize("database/global/audio/$file"));
		if (ob_get_contents())
		{
			ob_end_clean();
		}
		flush();
		readfile("database/global/audio/$file");
		exit;
	}
	else
	{
		http_response_code(404);
		exit;
	}

	return "";
}

?>
