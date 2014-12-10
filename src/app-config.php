<?php

define('MODE_FRED', 'mode_fred');
define('MODE_SOCGEN', 'mode_socgen');

// ** MODE ** //
define('MODE', MODE_SOCGEN);
#define('MODE', MODE_SOCGEN);

// ** VERSION SOCGEN ** //
if(MODE == MODE_SOCGEN){
	/** Application URL */
	define('APPURL', 'http://soleng.fr.world.socgen/Reporting/');

	/** MySQL hostname */
	define('DB_HOST', 'localhost:3306');

	/** The name of the database */
	define('DB_NAME', 'report');

	/** MySQL database username */
	define('DB_USER', 'report');

	/** MySQL database password */
	define('DB_PASSWORD', 'Bigchange14');
}

// ** VERSION FRED ** //
if(MODE == MODE_FRED){
	/** Application URL */
	define('APPURL', 'http://sol-eng.fr/app/');

	/** MySQL hostname */
	define('DB_HOST', 'solengfrejwp.mysql.db');

	/** The name of the database */
	define('DB_NAME', 'solengfrejwp');

	/** MySQL database username */
	define('DB_USER', 'solengfrejwp');

	/** MySQL database password */
	define('DB_PASSWORD', 'Bigchange14');
}
// ** COMMON ** //

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/**
 * Debugging mode
 * Change this to true to enable the display of notices during development.
*/
define('APP_DEBUG', true);

/* That's all, stop editing! Enjoy. */

/** Absolute path to the app directory. */
define('ABSPATH', dirname(__FILE__) . '/');
define('APPINC', 'app-includes/' );

/** Setup the environment and global vars */
require_once(ABSPATH . APPINC . 'settings.php');

/** http://soleng.fr.world.socgen/login/login.php?logout=true&appName=__ANY__
