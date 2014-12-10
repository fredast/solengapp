<?php
/**

*/

/** Include files needed for initialisation */
require( ABSPATH . APPINC . 'constants.php' );
require( ABSPATH . APPINC . 'load.php' );
require( ABSPATH . APPINC . 'db.php' );
require( ABSPATH . APPINC . 'functions.php' );

/** Activate debug mode if requested */
app_debug_mode();

/** Initialise the database */
app_db_init();

/** Additional functions load */

