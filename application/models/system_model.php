<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class System_model extends CI_Model{

	function __construct()
	{
		$this->load->database();
	}

	public function registerUser()
	{
		$data = array(
			'username' => $this->input->post('username'),
			'password' => sha1($this->input->post('password'))
			);
		$this->db->insert('users', $data);
	}

	public function login()
	{
		$username = $this->input->post('username');
		$password = sha1($this->input->post('password'));
		$result = $this->db->query("SELECT username FROM users WHERE username=" . $this->db->escape($username) . " AND password=" . $this->db->escape($password));
		if($result->num_rows() == 0)
			return false;
		else
			return true;
	}

	public function getUsername() {
		if($this->_isLogged())
		{
			return $this->session->userdata('username');
		}
	}

	public function isLogged() {
		if($this->session->userdata('username'))
		{
			return TRUE;
		}
		else
		{
			return FALSE;
		}
	}

	public function firstRun()
	{
		$result = $this->db->query("SELECT first_run FROM users WHERE username=" . $this->db->escape($this->input->post('username')));
		if($result->row()->first_run) 
			return true;
		else
			return false;
	}

	public function setNotFirstRun()
	{
		$this->db->query("UPDATE users SET first_run=0 WHERE username=" . $this->db->escape($this->input->post('username')));
	}

	public function userExists($username)
	{
		$result = $this->db->query("SELECT username FROM users WHERE username=" . $this->db->escape($username));
		if($result->num_rows() == 0)
			return false;
		else
			return true;
	}

	public function usersDir() {
		return 'users/';
	}

	public function userDir() {
		return $this->usersDir() . $this->session->userdata('username') . '/';
	}

}