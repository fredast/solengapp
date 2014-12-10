<?php
/**


*/

/** Include files needed for page load */
//require( ABSPATH . APPINC . 'misc-functions.php' );

$page_path_level += 1;
$misc_key = $page_path[$page_path_level];

/*if($misc_key == DATA_KEY){
	misc_data();
}*/

page_header( 'MISC' , INCLUDE_MISC);

require(ABSPATH . APPCONTENT . 'misc/misc-template-header.html');
require(ABSPATH . APPCONTENT . 'misc/misc-template-body.html');
$script = '<script>' . PHP_EOL;
$script .= "var misc1 = new misc('#misc-cmd-add', '#misc-panel-container', '#misc-update-info', '" . APPURL . "data/');" . PHP_EOL;
$script .= '</script>' . PHP_EOL;
echo $script;

app_die();