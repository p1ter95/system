<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Members extends CI_Controller {
	public function __construct()
	{
		parent::__construct();
		$this->load->model('system_model');
		$this->load->helper(array('url', 'form'));
		$this->load->library('session');
	}

	public function register() 
	{
		$errors = array();
		$data = array();

		$username = $this->input->post('username');
		$password = $this->input->post('password');
		$password_conf = $this->input->post('password_conf');

		if($this->system_model->userExists($username))
		{
			$errors[] = $username . '  is already taken';
		}
		if($username == '')
		{
			$errors[] = "You didn't enter username";
		}
		if($password == '')
		{
			$errors[] = "You didn't enter password";
		}
		if($password_conf == '')
		{
			$errors[] = "You didn't enter password confirmation";
		}
		if($password != $password_conf)
		{
			$errors[] = "Given passwords don't match";
		}
		if(strlen($username) < 5 || strlen($username) > 15)
		{
			$errors[] = 'Wrong username length (The range is from 5 to 15 characters)';
		}
		if(strlen($password) < 5)
		{
			$errors[] = 'Password too short (At least 5 characters are required)';
		}

		if(count($errors) > 0) {
			$data['success'] = 'false';
		}
		else
		{
			$data['success'] = 'true';
			$this->system_model->registerUser();
			mkdir($this->system_model->usersDir() . $username, 0700, TRUE);
		}
		$data['message'] = $errors;
		echo json_encode($data);
		
	}

	private function setSessionData() {

		$username = $this->input->post('username');

		$result = $this->db->query("SELECT ID FROM users WHERE username=" . $this->db->escape($username));
		$id = $result->row()->ID;

		$result = $this->db->query("SELECT type FROM users WHERE username=" . $this->db->escape($username));
		$type = $result->row()->type;

		$ip_address = $this->input->ip_address();
		$this->db->query("UPDATE users SET ip_address='$ip_address' WHERE ID='$id'");

		$data = array(
			'username' => $username,
			'id' => $id,
			'type' => $type
			);

		$this->session->set_userdata($data);
	}

	public function logout(){
		$data = array(
			'username' => '',
			'id' => '',
			'profile_id' => '',
			'type' => '',
			);
		$this->session->unset_userdata($data); //FIX
		$this->session->sess_destroy();
		echo json_encode(TRUE);
	}

	public function is_logged() {
		$data = array();
		if($this->system_model->isLogged())
		{
			$data = TRUE;
		}
		else
		{
			$data = FALSE;
		}

		echo json_encode($data);
	}

	public function getUsername() {
		$data = array();
		if($this->system_model->isLogged())
		{
			$data = $this->session->userdata('username');
		}
		else{
			$data = FALSE;
		}
		echo json_encode($data);
	}

	public function login()
	{
		$data = array();
		if($this->system_model->login())
		{
			$this->setSessionData();
			$data['first_run'] = $this->system_model->firstRun() ? TRUE : FALSE;
			$this->system_model->setNotFirstRun();
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}

}