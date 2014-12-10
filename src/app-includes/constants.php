<?php
/**

*/

# Names
define( 'APP_NAME', 'sol-eng');

# Folders
define( 'APPCONTENT', 'app-content/' );
define ( 'BOOTSTRAPPATH', APPURL . APPINC . 'bootstrap-3.2.0-dist/' );
#define ( 'BOOTSTRAPPATH', APPURL . APPINC . 'bootstrap-2.3.2/' );

# Path
define( 'SAVE_KEY', 'save' );
define( 'DATA_KEY', 'data' );
define( 'SAVE_FILTER_KEY', 'save-filter' );

# Standard pages
define( 'PAGE_LOGIN', 'login.php' );
define( 'PAGE_ERROR', ABSPATH . APPCONTENT . 'error.php' );

# Database tables
define( 'TABLE_DATA_TYPE', 'app_data_type' );
define( 'TABLE_DATA_FIELD', 'app_data_field' );
define( 'TABLE_DATA_FIELD_META', 'app_data_field_meta' );
define( 'TABLE_DATA_ENTRY', 'app_data_entry' );
define( 'TABLE_DATA_ENTRY_META', 'app_data_entry_meta' );
define( 'TABLE_USER_META', 'app_user_meta' );
define( 'TABLE_MISC_DATA', 'app_misc_data' );
define( 'TABLE_DA_DATA', 'app_da_data' );
define( 'TABLE_PARAM', 'app_param' );
define( 'TABLE_REPORT_TYPE', 'app_report_type' );
define( 'TABLE_REPORT_DATA', 'app_report_data' );
define( 'TABLE_USER', 'app_user' );

define( 'MISC_MAX_HISTORY', 10 );
define( 'REPORT_MAX_HISTORY', 10 );

# Headers
$include_report = '<link rel="stylesheet" media="screen" href="' . APPURL . APPINC . 'css/handsontable.full.css">' . PHP_EOL;
$include_report .= '<script src="' . APPURL . APPINC . 'js/handsontable.full.js"></script>' . PHP_EOL;
$include_report .= '<script src="' . APPURL . APPINC . 'js/report.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_report .= '<script src="http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.3/moment.min.js"></script>' . PHP_EOL;
define( 'INCLUDE_REPORT', $include_report );

$include_misc = '<link rel="stylesheet" media="screen" href="' . APPURL . APPINC . 'css/bootstrap-tagsinput.css">' . PHP_EOL;
$include_misc .= '<script src="' . APPURL . APPINC . 'js/jquery.autosize.min.js"></script>' . PHP_EOL;
$include_misc .= '<script src="' . APPURL . APPINC . 'js/bootstrap-tagsinput.js"></script>' . PHP_EOL;
$include_misc .= '<script src="' . APPURL . APPINC . 'js/bootstrap3-typeahead.min.js"></script>' . PHP_EOL;
$include_misc .= '<script src="' . APPURL . APPINC . 'js/misc.js?rand=' . time() . '"></script>' . PHP_EOL;
define( 'INCLUDE_MISC', $include_misc );

$include_dashboard_admin = '<link rel="stylesheet" media="screen" href="' . APPURL . APPINC . 'css/bootstrap-tagsinput.css">' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . APPURL . APPINC . 'js/bootstrap-tagsinput.js"></script>' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . APPURL . APPINC . 'js/bootstrap3-typeahead.min.js"></script>' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . APPURL . APPINC . 'js/packery.pkgd.min.js"></script>' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . APPURL . APPINC . 'js/draggabilly.pkgd.min.js"></script>' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . APPURL . APPINC . 'js/widgets.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . APPURL . APPINC . 'js/dashboard-admin.js?rand=' . time() . '"></script>' . PHP_EOL;
define( 'INCLUDE_DASHBOARD_ADMIN', $include_dashboard_admin );

$include_dashboard = '<link rel="stylesheet" media="screen" href="' . APPURL . APPINC . 'css/bootstrap-tagsinput.css">' . PHP_EOL;
$include_dashboard .= '<link rel="stylesheet" media="screen" href="' . APPURL . APPINC . 'css/handsontable.full.css">' . PHP_EOL;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/handsontable.full.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/numeral.min.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/bootstrap3-typeahead.min.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/packery.pkgd.min.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/widgets.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/dashboard.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_dashboard .= '<script src="http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.3/moment.min.js"></script>' . PHP_EOL;
define( 'INCLUDE_DASHBOARD', $include_dashboard );
