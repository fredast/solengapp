<?php
/**


*/

class appdb {
	
	protected $dbhost;
	protected $dbname;
	protected $dbuser;
	protected $dbpassword;
	protected $dbcharset;
	
	protected $dbh;
	
	function __construct( $dbhost, $dbname, $dbuser, $dbpassword, $dbcharset ) {
		
		$this->dbuser = $dbuser;
		$this->dbpassword = $dbpassword;
		$this->dbname = $dbname;
		$this->dbhost = $dbhost;
		$this->dbcharset = $dbcharset;
		
		$this->db_connect();
		$this->set_charset();
	}
	
	function db_connect() {
		$this->dbh = new PDO('mysql:host=' . $this->dbhost . ';dbname=' . $this->dbname, $this->dbuser, $this->dbpassword);
	}
	
	function query($query) {
		$req = $this->dbh->query($query);
		return $req;
	}
	
	function prepare($query) {
		$req = $this->dbh->prepare($query);
		return $req;
	}
	
	function query_void($query, $param) {
		$req = $this->prepare($query);
		$req->execute($param);
		return $req;
	}
	
	function set_charset() {
		$this->query('SET NAMES ' . $this->dbcharset);
	}
	
	function query_first($query, $param) {
		$req = $this->prepare($query);
		$req->execute($param);
		$data = $req->fetch();
		return $data;
	}
	
	function query_all($query, $param) {
		$req = $this->prepare($query);
		$req->execute($param);
		$data = $req->fetchAll();
		return $data;
	}
	
	function update_else_insert($table, $where_string, $where_arg, $set_string, $set_arg, $insert_string, $insert_arg){
		if($this->query_first('SELECT * FROM ' . $table . ' ' . $where_string, $where_arg)){
			if($set_string != ''){
				$this->query_void('UPDATE ' . $table . ' ' . $set_string . ' ' . $where_string, array_merge($set_arg, $where_arg));
			}
		}
		else{
			$this->query_void('INSERT INTO ' . $table . ' ' . $insert_string, $insert_arg);
		}
	}
	
	function lastInsertId(){
		return $this->dbh->lastInsertId();
	}
	
	function get_param($code){
		$req = $this->query_first('SELECT * FROM ' . TABLE_PARAM . ' WHERE code = ?', array($code));
		$param = json_decode($req['json']);
		return $param;
	}
	
}