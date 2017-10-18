<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Image extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model('system_model');
		$this->load->helper(array('url', 'file'));
		$this->load->library('session');
	}
	
	//FILE DOWNLOAD

	public function get_image_dimensions()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('get_image_dimensions_path');
			$size = @getimagesize($path);
			$data = $size ? array('width' => $size[0], 'height' => $size[1]) : FALSE;
		}
		else
    	{
    		$data = FALSE;
    	}

		echo json_encode($data);
	}

}