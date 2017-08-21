<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Members extends CI_Controller {
	public function __construct()
	{
		parent::__construct();
		$this->load->model('members_model');
		$this->load->model('index_model');
		$this->load->helper(array('form', 'url'));
		$this->load->library('session');
	}

	public function register()
	{
		$this->load->library('form_validation');

		$this->form_validation->set_rules('username', 'Nazwa użytkownika', 'required|min_length[5]|max_length[15]|is_unique[users.username]|xss_clean|');
		$this->form_validation->set_rules('password', 'Hasło', 'required|min_length[5]');
		$this->form_validation->set_rules('confirm_password', 'Hasło potwierdzające', 'required||matches[password]');
		$this->form_validation->set_error_delimiters('<span class="error">', '</span>');

		$result = '';
		if($this->input->post('registerButton'))
		{

			if ($this->form_validation->run() == FALSE)
			{
				$result = 'Rejestracja nie powiodła się|fail';
			}
			else
			{
				$result = 'Rejestracja zakończona powodzeniem|success';
				$this->members_model->registerUser();
			}
		}


		$data = array(
			'online' => $this->members_model->getOnlineUsers(),
			'message' => $result,
			'title' => 'Rejestracja'
			);
		$this->load->template('register', $data);
	}

	public function profile($id)
	{
		$this->members_model->updateProfileViews2($id);
		$data = array(
			'profile' => $this->members_model->getUser($id),
			'online' => $this->members_model->getOnlineUsers()
			);
		if($this->members_model->getUser($id) != NULL)
		{
			$data['title'] = $this->members_model->getUser($id)->username;
		}
		else
		{
			$data['title'] = 'Brak takiego użytkownika';
		}
		$this->load->template('profile',$data);
	}

	private function _login()
	{
		if($this->index_model->login()) 
		{
				$this->index_model->setSessionData();
				$this->members_model->updateLastSeen();
				redirect(base_url());
		}
		else
		{
		echo 'Nie udalo sie zalogować';
		}
	}


	public function login()
	{
		if($this->input->post('submit'))
		{
			$this->_login();
		}
	}

	public function logout()
	{
		$this->index_model->logout();
		redirect(base_url());
	}
}