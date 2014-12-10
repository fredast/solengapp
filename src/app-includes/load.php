<?php
/**


*/

/* Activate debugging mode if requested in app-config.php */
function app_debug_mode() {
	if ( APP_DEBUG ) {
		error_reporting( E_ALL );
		ini_set( 'display_errors', 1 );
	} else {
		error_reporting( E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_WARNING | E_PARSE | E_USER_ERROR | E_USER_WARNING | E_RECOVERABLE_ERROR );
	}
}

/* Initialise the connection with the database */
function app_db_init() {
	global $appdb;
	
	$appdb = new appdb( DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_CHARSET);
}

function app_die($message = "") {
	echo $message;
	die();
}
	