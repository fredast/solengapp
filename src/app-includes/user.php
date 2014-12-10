<?php
if(MODE == MODE_SOCGEN){
	require_once(dirname(dirname(dirname(__FILE__))) . '/login/soleng_session_check.php');
}

/* Check is the user is logged in, redirect  */
function user_check_login() {
	global $login, $appdb;
	/* Version Fred */
	if(MODE == MODE_FRED){
		$login='frederic.aoustin';
	}
	/* Version SESAME */
	if(MODE == MODE_SOCGEN){
		$thisApp='Reporting';
		$login=CheckSSO($thisApp);
	}
	get_user_options();
}

function get_user_options(){
	global $appdb, $login, $user_options;
	$req = $appdb->query_first('SELECT * FROM ' . TABLE_USER . ' WHERE user = ?', array($login));
	// Enter the user in the database if he/she doesn't exist
	if($req == false){
		// Add the user
		$appdb->query_void('INSERT INTO ' . TABLE_USER . ' (user, json_public, json_private) VALUES (?, ?, ?)', array($login, '{}', '{}'));
		$req = $appdb->query_first('SELECT * FROM ' . TABLE_USER . ' WHERE user = ?', array($login));
	}
	$req['json_public'] = json_decode($req['json_public']);
	$req['json_private'] = json_decode($req['json_private']);
	// Update the user
	$req['json_private']->last_visit = time();	
	$appdb->query_void('UPDATE ' . TABLE_USER . ' SET json_private = ? WHERE user = ?', array(json_encode($req['json_private']), $login));
	// Pass the login and the access rights
	$req['json_public']->login = $login;
	if(isset($req['json_private']->access)){
		$req['json_public']->access = $req['json_private']->access;
	}
	// Save the user options as a global variable
	$user_options = $req;
}

function user_save_public_options($options){
	global $appdb, $login, $user_options;
	
	// Modify the options
	foreach($options as $key => &$option){
		$user_options['json_public']->{$key} = $option;
	}
	// Save the options
	$appdb->query_void('UPDATE ' . TABLE_USER . ' SET json_public = ? WHERE user = ?', array(json_encode($user_options['json_public']), $login));
}
