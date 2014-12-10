<?php
/**


*/

function page_parse_url() {
	global $page_path, $page_path_level;

	# Depth of the application URL
	$app_url_depth = count(explode("/", APPURL));

	# Requested URL
	$requested_url = strtolower($_SERVER['REQUEST_URI']); # try $_SERVER['REDIRECT_URL'] if it doesn't work
	# Add a slash at the end if it isn't there
	if(substr($requested_url, -1) != '/'){
		$requested_url .= '/';
	}
	$page_path = explode("/", $requested_url);
	$page_path = array_slice($page_path, $app_url_depth - 3);
	$page_path_level = 0;
}

function module_exists($location, $name) {
	$path = $location . $name . '/' . $name . '.php';
	if( file_exists($path) ){
		return $path;
	}
	else{
		return false;
	}
}

function page_header($page_title = APP_NAME, $additional_head = "") {
	global $login;
	$header = '<!doctype html>' . PHP_EOL;
	$header .= '<html lang="en">' . PHP_EOL;
	$header .= '<head>' . PHP_EOL;
	$header .= '<title>' . $page_title . '</title>' . PHP_EOL;
	# Includes
	$header .= '<meta name="viewport" content="width=device-width, initial-scale=1">' . PHP_EOL;
	$header .= '<meta name="apple-mobile-web-app-capable" content="yes">' . PHP_EOL;
	// jQuery
	$header .= '<script src="' . APPURL . APPINC . 'js/jquery-1.11.1.min.js"></script>' . PHP_EOL;
	// Bootstrap
	$header .= '<link rel="stylesheet" href="' . BOOTSTRAPPATH . 'css/bootstrap.min.css">' . PHP_EOL;
	#$header .= '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css">' . PHP_EOL;
	$header .= '<script src="' . BOOTSTRAPPATH . 'js/bootstrap.min.js"></script>' . PHP_EOL;
	#$header .= '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js"></script>' . PHP_EOL;
	// Custom CSS
	$header .= '<link rel="stylesheet" href="' . APPURL . APPINC . 'css/custom-css.css?rand=' . time() . '">' . PHP_EOL;

	$header .= $additional_head . PHP_EOL;
	$header .= '</head>' . PHP_EOL . PHP_EOL;
	$header .= '<body>' . PHP_EOL;
	$header .= navbar();
	#$header .= 'This is the header <br/>' . PHP_EOL;

	# User only header
	if(isset($login)){

	}
	echo $header;
	return true;
}

function navbar() {
	global $login, $user_options;
	$navbar = '<nav class="navbar navbar-default navbar-fixed-top" role="navigation">' . PHP_EOL;
	$navbar .= '<div class="container">' . PHP_EOL;
    # Brand and toggle get grouped for better mobile display -->
    $navbar .= '<div class="navbar-header">' . PHP_EOL;
    $navbar .= '<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-navbar-main-1">' . PHP_EOL;
    $navbar .= '<span class="sr-only">Toggle navigation</span>' . PHP_EOL; # What point ?
    $navbar .= '<span class="icon-bar"></span>' . PHP_EOL;
	$navbar .= '<span class="icon-bar"></span>' . PHP_EOL;
    $navbar .= '</button>' . PHP_EOL;
    $navbar .= '<a class="navbar-brand" href="' . APPURL . '">' . APP_NAME . '</a>' . PHP_EOL;
    $navbar .= '</div>' . PHP_EOL;

    # Collect the nav links, forms, and other content for toggling -->
    $navbar .= '<div class="collapse navbar-collapse" id="bs-navbar-main-1">' . PHP_EOL;
    $navbar .= '<ul class="nav navbar-nav">' . PHP_EOL;
	$navbar .= navbar_module_link('Dashboard', array('dashboard'), array(''));
	$dropdown_content = navbar_module_link('Deals', array('report','deals'));
	$dropdown_content .= navbar_module_link('Meetings', array('report','meetings'));
	$dropdown_content .= navbar_module_link('Pipe', array('report','pipe'));
	$dropdown_content .= navbar_module_link('Misc', array('report','misc'));
	$navbar .= navbar_dropdown('Report', $dropdown_content, array('report'));
	if(isset($user_options['json_private']->access) && array_search('ADMIN', $user_options['json_private']->access) != false){
		$navbar .= navbar_module_link('Admin', array('dashboard-admin'));
	}
	$navbar .= '</ul>' . PHP_EOL;
    $navbar .= '<ul class="nav navbar-nav navbar-right">' . PHP_EOL;
	if (isset($login)){
		$navbar .= '<p class="navbar-text navbar-right">' . $login . '</p>' . PHP_EOL;
	}
    $navbar .= '</ul>' . PHP_EOL;
    $navbar .= '</div>' . PHP_EOL;
	$navbar .= '</div>' . PHP_EOL;
	$navbar .= '</nav>' . PHP_EOL;
	return $navbar;
}

function navbar_module_link($module_name, $module_path, $alt_module_path = null) {
	$link = '<li';
	if(navbar_is_active($module_path) or navbar_is_active($alt_module_path)){
		$link .= ' class="active"';
	}
	$link .= '><a href="' . APPURL . array_to_string($module_path, '/') . '/">' . $module_name . '</a></li>' . PHP_EOL;
	return $link;
}

function navbar_dropdown($dropdown_name, $dropdown_content, $dropdown_path = Null) {
	global $page_path;
	$dropdown = '<li class="dropdown';
	if(navbar_is_active($dropdown_path)){
		$dropdown .= ' active';
	}
	$dropdown .= '">' . PHP_EOL;
	$dropdown .= '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' . $dropdown_name . '<span class="caret"></span></a>' . PHP_EOL;
	$dropdown .= '<ul class="dropdown-menu" role="menu">' . PHP_EOL;
	$dropdown .= $dropdown_content;
	$dropdown .= '</ul>' . PHP_EOL;
	$dropdown .= '</li>' . PHP_EOL;
	return $dropdown;
}

function navbar_is_active($path){
	global $page_path;
	if($path == null){
		return false;
	}
	$is_active = true;
	$depth = 0;
	foreach($path as &$name){
		if(count($page_path) <= $depth or $name != $page_path[$depth]){
			$is_active = false;
		}
		$depth += 1;
	}
	return $is_active;
}

