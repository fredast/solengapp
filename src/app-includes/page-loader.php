<?php
/**


*/

/** Include files needed for page load */
require( ABSPATH . APPINC . 'user.php' );
require( ABSPATH . APPINC . 'page.php' );

/** Check if the user is logged in, if not redirect to login page */
user_check_login();

/** Parse the requested url */
page_parse_url();

/** 
 * Goto the requested module if it exist,
 * Goto the error page if it does'nt exist,
 * Goto the default module if there is no module requested.
*/
//$module_name = $page_path[$page_path_level];
if($page_path[$page_path_level] == ""){
	/* Default module */
	$page_path[$page_path_level] = 'dashboard';
}
$target = module_exists(ABSPATH . APPCONTENT, $page_path[$page_path_level]);
if($target == false){
	require(PAGE_ERROR);
	die();
}
else{
	require($target);
	die();
}

echo '/n End of index';