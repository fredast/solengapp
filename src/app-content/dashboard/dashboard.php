<?php
/**


*/

page_header( 'Dashboard' , INCLUDE_DASHBOARD );

require(ABSPATH . APPCONTENT . 'dashboard/dashboard-template.html');
$script = '<script>dashboard1 = new Dashboard("' . APPURL . 'data/");</script>';
echo $script;

app_die();