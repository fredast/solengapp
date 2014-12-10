<?php
/**


*/

$page_path_level += 1;
$report_key = $page_path[$page_path_level];

if($report_key == 'misc'){
	require(ABSPATH . APPCONTENT . 'misc/misc.php');
}

page_header( 'Report', INCLUDE_REPORT);

require(ABSPATH . APPCONTENT . 'report/report-template.html');

$script = '<script>' . PHP_EOL;
$script .= 'var report1 = new Report("' . APPURL . 'data/", "' . $report_key . '");' . PHP_EOL;
$script .= '</script>' . PHP_EOL;
echo $script;

app_die();
