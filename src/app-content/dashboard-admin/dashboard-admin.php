<?php
/**


*/

//require( ABSPATH . APPINC . 'da-functions.php' );

$page_path_level += 1;
$da_key = $page_path[$page_path_level];

// Check is user is admin
if(!isset($user_options['json_private']->access) or array_search('ADMIN', $user_options['json_private']->access) == false){
	require(PAGE_ERROR);
	die();
}

page_header( 'Dashboard - Admin' , INCLUDE_DASHBOARD_ADMIN );

require(ABSPATH . APPCONTENT . 'dashboard-admin/dashboard-admin-template.html');
// $script = '<script>dashboardAdmin1 = new dashboardAdmin("' . APPURL . 'dashboard-admin/data/");</script>';
$script = '<script>dashboardAdmin1 = new dashboardAdmin("' . APPURL . 'data/");</script>';
echo $script;

app_die();