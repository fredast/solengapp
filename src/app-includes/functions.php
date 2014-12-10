<?php
/**


*/

function extract_array_column($array, $column_key) {
	$column = array();
	foreach($array as $key => &$element){
		$column[$key] = $element[$column_key];
	}
	return $column;
}

function array_to_string($array, $delimiter = ', ', $before = '', $after = '') {
	$string = '';
	$first = true;
	foreach($array as &$element){
		if(!$first){
			$string .= $delimiter;
		}
		else{
			$first = false;
		}
		$string .= $before . $element . $after;
	}
	return $string;
}