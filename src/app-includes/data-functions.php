<?php
/**


*/

function get_data(){
	if(isset($_POST['type']) and isset($_POST['request'])){
		$type = $_POST['type'];
		$request = $_POST['request'];
	}
	else{
		echo 'Missing type/request!';
		die();
	}
	if($type == 'dashboard'){
		if($request == 'save'){
			da_save();
		}
		if($request == 'load'){
			da_load();
		}
	}
	if($type == 'misc'){
		if($request == 'save'){
			misc_save();
		}
		if($request == 'load'){
			misc_load();
		}
	}
	if($type == 'report'){
		if($request == 'save'){
			report_save();
		}
		if($request == 'load'){
			report_load();
		}
	}
	if($type == 'userOptions'){
		if($request == 'save'){
			userOptions_save();
		}
	}
	
	app_die();
}

/*
	------------
	Dashboard
	------------
*/

function da_save(){
	global $appdb, $user_options;
	
	// Check if the user is admin
	if(!isset($user_options['json_private']->access) or array_search('ADMIN', $user_options['json_private']->access) == false){
		die();
	}
	
	if(isset($_POST['data'])){
		$data = $_POST['data'];
	}
	else{
		echo 'No data!';
		die();
	}
	
	foreach($data as &$entry){
		// New entry
		if(!isset($entry['dbId'])){
			$appdb->query_void('INSERT INTO ' . TABLE_DA_DATA . ' (json) VALUES (?)', array(json_encode(array())));
			$entry['dbId'] = $appdb->lastInsertId();
		}
		// Update entry
		unset($entry['modified']);
		$appdb->query_void('UPDATE ' . TABLE_DA_DATA . ' SET json = ? WHERE id = ?', array(json_encode($entry), $entry['dbId']));
				
		// Delete entry
		if(isset($entry['deleted']) and $entry['deleted']){
			$appdb->query_void('DELETE FROM ' . TABLE_DA_DATA . ' WHERE id = ?', array($entry['dbId']));
		}
	}
	
	echo 'Success!';
	app_die();
}

function da_load(){
	global $appdb, $user_options;
	//Query the database
	// DATA
	$req = $appdb->query_all('SELECT * FROM ' . TABLE_DA_DATA, array());
	$data = array();
	foreach($req as &$entry){
		$data[] = json_decode($entry['json']);
	}
	// ARG LIST
	$arg_list = $appdb->get_param('arg_list');
	foreach($arg_list as &$arg){
		$arg->listData = $appdb->get_param($arg->listName);
	}
	// TAG LIST
	$misc_param = $appdb->get_param('misc_param');
	$misc_param->tagsTypeahead = $appdb->get_param($misc_param->tagsTypeaheadList);
	// REPORT TYPE LIST
	$req = $appdb->query_all('SELECT * FROM ' . TABLE_REPORT_TYPE, array());
	$type_list = array();
	foreach($req as &$type){
		$type_list[] = json_decode($type['json']);
	}
	//Return the data
	$result = array('data' => $data, 'argList' => $arg_list, 'miscParam' => $misc_param, 'userOptions' => $user_options['json_public'], 'reportTypeList' => $type_list);
	echo json_encode($result);
	app_die();
}

/*
	------------
	Misc
	------------
*/

function misc_save(){
	global $appdb, $login;
	if(isset($_POST['data'])){
		$data = $_POST['data'];
	}
	else{
		echo 'No data!';
		die();
	}
	
	foreach($data as &$entry){
		// New entry
		$new_entries = array();
		if($entry['status'] == 'tempId'){
			$appdb->query_void('INSERT INTO ' . TABLE_MISC_DATA . ' (json, user) VALUES (?, ?)', array(json_encode(array()), $login));
			$entry['id'] = $appdb->lastInsertId();
			$entry['status'] = 'id';
			$entry['createdUser'] = $login;
			$entry['createdTime'] = time();
			$new_entries[] = array('id' => $entry['id'], 'tempId' => $entry['tempId']);
		}
		unset($entry['tempId']);
		// Query the entry history
		$req = $appdb->query_first('SELECT * FROM ' . TABLE_MISC_DATA . ' WHERE id = ?', array($entry['id']));
		if($req == false){
			continue;
		}
		$data_array = json_decode($req['json']);
		if(count($data_array) > MISC_MAX_HISTORY){
			reset($data_array);
			unset($data_array[key($data_array)]);
		}
		//Add meta to the entry
		$entry['updatedUser'] = $login;
		$entry['updatedTime'] = time();
		// Add the entry to the history
		$data_array[] = $entry;
		$appdb->query_void('UPDATE ' . TABLE_MISC_DATA . ' SET json = ? WHERE id = ?', array(json_encode($data_array), $entry['id']));
	}
	
	echo json_encode(array('success' => 'true', 'newId' => $new_entries));
	
	app_die();
}

function misc_load(){
	global $appdb, $login;
	$all = false;
	if(isset($_POST['all']) && $_POST['all']){
		$all = true;
	}
	
	//Query the database
	if($all){
		$req = $appdb->query_all('SELECT * FROM ' . TABLE_MISC_DATA, array());
	}
	else{
		$req = $appdb->query_all('SELECT * FROM ' . TABLE_MISC_DATA . ' WHERE user = ?', array($login));
	}
	
	//Get the last historical entry
	$data = array();
	foreach($req as &$entry){
		$histo = json_decode($entry['json']);
		$data[] = end($histo);
	}
	
	// Query the options
	$param = $appdb->get_param('misc_param');
	$param->tagsTypeahead = $appdb->get_param($param->tagsTypeaheadList);
	
	//Return the data
	$result = array('data' => $data, 'param' => $param);
	echo json_encode($result);
}

/*
	------------
	Report
	------------
*/

function report_load(){
	global $appdb, $login, $user_options;
	$all = false;
	if(isset($_POST['all']) && $_POST['all']){
		$all = true;
	}
	if(!isset($_POST['dataType'])){
		echo 'No data type!';
		die();
	}
	
	// Get the data type
	$req = $appdb->query_first('SELECT * FROM ' . TABLE_REPORT_TYPE . ' WHERE code = ?', array($_POST['dataType']));
	if($req == false){
		echo 'No data type!';
		die();
	}
	$data_type = json_decode($req['json']);
	foreach($data_type->columns as &$column){
		if(isset($column->sourceList)){
			$column->source = $appdb->get_param($column->sourceList);
		}
	}

	//Query the database
	if($all){
		$req = $appdb->query_all('SELECT * FROM ' . TABLE_REPORT_DATA . ' WHERE type = ? AND deleted = 0', array($data_type->code));
	}
	else{
		$req = $appdb->query_all('SELECT * FROM ' . TABLE_REPORT_DATA . ' WHERE type = ? AND user = ? AND deleted = 0', array($data_type->code, $login));
	}
	
	//Get the last historical entry
	$data = array();
	foreach($req as &$entry){
		$histo = json_decode($entry['json']);
		$last_entry = end($histo);
		// Check if the user can access
		$can_access = false;
		if(isset($last_entry->createdUser) && $last_entry->createdUser == $login){
			$can_access = true;
		}
		else{
			if(isset($user_options['json_private']->access)){
				foreach($user_options['json_private']->access as &$group){
					if($group == "SUPERVIEWER" or $group == "ADMIN" or (isset($last_entry->business) and $group == $last_entry->business)){
						$can_access = true;
					}
				}
			}
		}
		if($can_access){
			$data[] = $last_entry;
		}
	}
	
	//Return the data
	$result = array('dataType' => $data_type, 'data' => $data, 'userOptions' => $user_options['json_public']);
	echo json_encode($result);
}

function report_save(){
	global $appdb, $login;
	if(isset($_POST['data'])){
		$data = $_POST['data'];
	}
	else{
		echo 'No data!';
		die();
	}
	if(!isset($_POST['dataType'])){
		echo 'No data type!';
		die();
	}
	
	//var_dump($data);
	
	foreach($data as &$entry){
		// New entry
		if(!isset($entry['dbId']) || $entry['dbId'] == "null" || $entry['dbId'] == null){
			$appdb->query_void('INSERT INTO ' . TABLE_REPORT_DATA . ' (json, user, type) VALUES (?, ?, ?)', array(json_encode(array()), $login, $_POST['dataType']));
			$entry['dbId'] = $appdb->lastInsertId();
			$entry['createdUser'] = $login;
			$entry['createdTime'] = time();
		}
		// Query the entry history
		$req = $appdb->query_first('SELECT * FROM ' . TABLE_REPORT_DATA . ' WHERE id = ?', array($entry['dbId']));
		if($req == false){
			continue;
		}
		$data_array = json_decode($req['json']);
		if(count($data_array) > REPORT_MAX_HISTORY){
			reset($data_array);
			unset($data_array[key($data_array)]);
		}
		//Add meta to the entry
		$entry['updatedUser'] = $login;
		$entry['updatedTime'] = time();
		unset($entry['modified']);
		// Add the entry to the history
		$data_array[] = $entry;
		$appdb->query_void('UPDATE ' . TABLE_REPORT_DATA . ' SET json = ? WHERE id = ?', array(json_encode($data_array), $entry['dbId']));
		// Mark the entry as deleted if necessary
		if($entry['deleted']){
			$appdb->query_void('UPDATE ' . TABLE_REPORT_DATA . ' SET deleted = 1 WHERE id = ?', array($entry['dbId']));
		}
	}
	
	echo 'Done!';
}

/*
	------------
	UserOptions
	------------
*/

function userOptions_save(){
	global $user_options;
	if(isset($_POST['data'])){
		$data = $_POST['data'];
	}
	else{
		echo 'No data!';
		die();
	}
	
	user_save_public_options($data);
	
	echo 'Options saved!';
}