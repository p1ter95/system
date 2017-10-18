<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Filesystem extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model('system_model');
		$this->load->helper(array('url', 'form'));
		$this->load->library('session');
		$this->load->helper('file');
	}
	
	//FILE DOWNLOAD

	public function download_file($name)
	{
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . urldecode(preg_replace('/\~/', '/', $name));
			if (file_exists($path)) {				
			    header('Content-Description: File Transfer');
			    header('Content-Type: application/octet-stream');
			    header('Content-Disposition: attachment; filename=' . basename($path));
			    header('Expires: 0');
			    header('Cache-Control: must-revalidate');
			    header('Pragma: public');
			    header('Content-Length: ' . filesize($path));
			    readfile($path);
			    exit;
			}
			else
			{
				echo "File does not exist";
			}
    	}
    	else
    	{
    		echo "You didn't log in";
    	}
	}
	
	//FILE OPEN

	public function open_file($name)
	{
		if($this->system_model->isLogged())
		{
			//$name = $this->input->post('download_file_name');
			//$path = $this->system_model->userDir() . preg_replace(array('/_/', '/\~/'), array(' ', '/'), $name);
			$path = $this->system_model->userDir() . urldecode(preg_replace('/\~/', '/', $name));
			if (file_exists($path)) {				
				header('Content-Type:' . get_mime_by_extension($path));		//NEED TO DO THIS IN ANOTHER WAY
				header('Content-Disposition: inline; filename=' . basename($path));	
				header('Content-Length: ' . filesize($path));
			    readfile($path);
			    exit;
			}
			else
			{
				echo "File does not exist";
			}
    	}
    	else
    	{
    		echo "You didn't log in";
    	}
	}
	
	//FILE WRITE

	public function write_file()
	{
		$output = array();
		if($this->system_model->isLogged())
		{
			$data = $this->input->post('write_file_data');
			$path = $this->system_model->userDir() . $this->input->post('write_file_path');

			$output = write_file($path, $data);
		}
		else
    	{
    		$output = FALSE;
    	}

		echo json_encode($output);
	}
	
	//FILE READ

	public function read_file()
	{
		$data;
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('read_file_path');
			$data = @read_file($path);
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}
	
	//FILE DELETE
	
	public function delete_file()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('delete_file_path');
			$data = @unlink($path);
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}

	//FILE COPY

	public function copy_file()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('copy_file_path');
			$dest = $this->system_model->userDir() . $this->input->post('copy_file_destination');

			$path_parts = pathinfo($path);
            $filename = $path_parts['filename'];
            $extension = $path_parts['extension'];
            $basename = $path_parts['basename'];
            $str = $this->input->post('copy_of');

			if(file_exists($dest . '/' . $basename) && $this->input->post('copy_file_overwrite') === 'false') {
            	for($i = 1; ; $i++)
            	{     		
            		if(!file_exists($dest . '/' . $str . $filename . ' [' . $i . '].' . $extension))
            		{
            			if($data = copy($path, $dest . '/' . $str . $filename . ' [' . $i . '].' . $extension)) break;
            		}
            	}
            }
            else 
            {
            	$data = copy($path, $dest . '/' . $basename);
            }
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}
	
	//REMOTE FILE EXISTS

	public function remote_file_exists() {
		$data = array();
		if($this->system_model->isLogged())
		{
			$url = $this->input->post('remote_file_exists_url');
			if(@file_get_contents($url) === FALSE) {     
			    $data = FALSE;
			}
			else {
			    $data = TRUE;
			}
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}
	
	//FILE UPLOAD FROM DISK

	public function uploadFromDisk()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			$path = './' . $this->system_model->userDir() . $this->input->post('upload_path');
			$config['upload_path'] =  $path;
			$config['overwrite'] =  $this->input->post('upload_overwrite') === 'true' ? TRUE : FALSE;
			$config['allowed_types'] = '*';
			$this->load->library('upload', $config);

			if(!empty($_FILES['userfiles']['name'])) {
				for($i = 0; $i < count($_FILES['userfiles']['name']); $i++)
		        {
		            $_FILES['userfile']['name'] = $_FILES['userfiles']['name'][$i];
	                $_FILES['userfile']['type'] = $_FILES['userfiles']['type'][$i];
	                $_FILES['userfile']['tmp_name'] = $_FILES['userfiles']['tmp_name'][$i];
	                $_FILES['userfile']['error'] = $_FILES['userfiles']['error'][$i];
	                $_FILES['userfile']['size'] = $_FILES['userfiles']['size'][$i];

		            if (!$this->upload->do_upload())
					{
						$data['success'] = 'false';
						$data['message'] = $this->upload->display_errors('', '');
					}
					else
					{
						$data['success'] = 'true';
					}
		        }
			}
			else {
				$data['success'] = 'false';
				$data['message'] = 'No files selected';
			}	
		}
		else
		{
			$data['success'] = 'false';
		}
		echo json_encode($data);
	}
	
	//FILE UPLOAD FROM URL

	public function uploadFromUrl()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			$url = $this->input->post('upload_url');
			$path = $this->system_model->userDir() . $this->input->post('upload_path');

	        $path_parts = pathinfo($url);
	        $filename = $path_parts['filename'];
	        $extension = $path_parts['extension'];
	        $basename = $path_parts['basename'];

	        $content = @file_get_contents($url);

	        if($content === FALSE)
	        {
	        	$data['success'] = 'false';
	        }
	        else
	        {
		        if(file_exists($path . '/' . $basename) && $this->input->post('upload_overwrite') === 'false') {
		            for($i=1; ;$i++)
		            {     		
		            	if(!file_exists($path . '/' . $filename . ' [' . $i . '].' . $extension))
		            	{
		            		file_put_contents($path . '/' . $filename . ' [' . $i . '].' . $extension, $content);
		            		$data['success'] = 'true';
		            	}
		            	break;
		            }
		        }
		        else
		        {
		            if(@file_put_contents($path . '/' . $basename, $content) === FALSE)
		            {
						$data['success'] = 'false';
		            }
		            else
		            {
		            	$data['success'] = 'true';
		            }
		            
		        }   
	        } 
    	}
    	else
    	{
    		$data['success'] = 'false';
    	}
    	echo json_encode($data);
	}

	//FILE GET INFO

	public function get_file_info()
	{
		$data;
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('get_file_info_path');
			$data = get_file_info($path);
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}
	
	//DIRECTORY GET FILENAMES

	public function get_filenames()
	{
		$output = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('get_filenames_path');
			//get_filenames($path, ($this->input->post('get_filenames_include_path') == 'true' ? true : false))
			$files = scandir($path, SCANDIR_SORT_NONE);
			if(!$files)
			{
				$output = FALSE;
			}
			else {
				foreach ($files as $value) {
				    if ($value != '.' && $value != '..')
				        $output[] = $value;
				}
			}
    	}
    	else
    	{
    		$output = FALSE;
    	}
    	echo json_encode($output);
	}

	public function get_system_apps_filenames()
	{
		$output = array();
		if($this->system_model->isLogged())
		{
			$path = $this->input->post('get_system_apps_filenames_path');
			$parts = explode('/', $path);
			array_shift($parts);
			$new_path = implode('/', $parts);

			if(!$output = get_filenames('system-apps/' . $new_path, FALSE, TRUE))
			{
				$output = FALSE;
			}
    	}
    	else
    	{
    		$output = FALSE;
    	}
    	echo json_encode($output);
	}
	
	//GET DIRECTORY FILE INFO

	public function get_dir_file_info()
	{
		$output = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('get_dir_file_info_path');
			if(!$output = get_dir_file_info($path, ($this->input->post('get_dir_file_info_top_level_only') == 'true' ? true : false)))
			{
				$output = FALSE;
			}
    	}
    	else
    	{
    		$output = FALSE;
    	}
    	echo json_encode($output);
	}
	
	//DIRECTORY CREATE

	public function create_dir()
	{
		$output = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('create_dir_path');

	    	$output = @mkdir($path, 0700, TRUE);
    	}
    	else
    	{
    		$output = TRUE;
    	}
    	echo json_encode($output);
	}
	
	private function rrmdir($path){
		if (is_dir($path)) { 
	     	$objects = scandir($path); 
	     	foreach ($objects as $object) { 
	       		if ($object != "." && $object != "..") 
	       		{ 
	         		if (filetype($path."/".$object) == "dir") 
	         		{
	         			$this->rrmdir($path."/".$object);
	         		} 
	         		else 
	         		{
	         			return unlink($path."/".$object) ? TRUE : FALSE; 
	         		}
	       		} 
	     	} 
		    reset($objects); 
		    return rmdir($path) ? TRUE : FALSE;
		} 
		else
		{
			return FALSE;
		}
	}
	
	//DIRECTORY DELETE

	public function delete_dir()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('delete_dir_path');
			try {
				$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS),RecursiveIteratorIterator::CHILD_FIRST);
				
				foreach ($files as $fileinfo) {
					$todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
					$todo($fileinfo->getRealPath());
				}
				
				rmdir($path);
				$data = TRUE;
			}
			catch(Exception $e) {
				$data = FALSE;
			}					
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}
	
	//DIRECTORY COPY

	private function recurse_copy($src, $dst) {
		$dir = opendir($src); 
		mkdir($dst); 
		while(false !== ( $file = readdir($dir)) ) { 
			if (( $file != '.' ) && ( $file != '..' )) { 
				if ( is_dir($src . '/' . $file) ) { 
					$this->recurse_copy($src . '/' . $file, $dst . '/' . $file); 
				} 
				else { 
					copy($src . '/' . $file, $dst . '/' . $file); 
				} 
			} 
		} 
		closedir($dir); 
	}

	public function copy_dir()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('copy_dir_path');
			$dest = $this->system_model->userDir() . $this->input->post('copy_dir_destination');

            $basename = basename($path);
            $str = $this->input->post('copy_of');

			if(file_exists($dest . '/' . $basename) && $this->input->post('copy_dir_overwrite') === 'false') {
            	for($i=1; ; $i++)
            	{
            		if(!file_exists($dest . '/' . $str .  $basename . ' [' . $i . ']'))
            		{
						$this->recurse_copy($path, $dest . '/' . $str . $basename . ' [' . $i . ']');
						break;
            		}
            	}           	
            }
            else 
            {
            	$this->recurse_copy($path, $dest . '/' . $basename);
            }
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}
		
	//DIRECTORY/FILE EXISTS

	public function exists()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('exists_path');
			$data = file_exists($path);
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}

	//FILE/DIRECTORY RENAME

	public function rename_file()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			/*
			rename
			(rename)

			$path = $this->system_model->userDir() . $this->input->post('rename_file_path');
			$path_parts = pathinfo($path);
			$dest_path = $this->system_model->userDir() . $path_parts['dirname'] . '/' . $this->input->post('rename_new_name');

			(move)
			$path = $this->system_model->userDir() . $this->input->post('rename_file_path');
			$dest_path = $this->system_model->userDir() . $path_parts['dirname'] . '/' . $this->input->post('rename_new_name');

			*/
			$path = $this->system_model->userDir() . $this->input->post('rename_file_path');

			$path_parts = pathinfo($path);
            $extension = $path_parts['extension'];
            $basename = $path_parts['basename'];

			$dest_filename = $path_parts['dirname'] . '/' . $this->input->post('rename_new_name') . '.' . $extension;
			$dest = $path_parts['dirname'];

            $str = $this->input->post('copy_of');

            //echo json_encode($path_parts);

			if(file_exists($dest_filename) && $this->input->post('rename_overwrite') === 'false') {
            	for($i = 1; ; $i++)
            	{     		
            		if(!file_exists($dest . '/' . $str . $this->input->post('rename_new_name') . ' [' . $i . '].' . $extension))
            		{
            			if($data = @rename($path, $dest . '/' . $str . $this->input->post('rename_new_name') . ' [' . $i . '].' . $extension)) break;
            		}
            	}
            }
            else 
            {
            	$data = @rename($path, $dest_filename);
            }
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}

	//FILE/DIRECTORY DIRECOTRY

	public function rename_dir()
	{
		$data = array();
		if($this->system_model->isLogged())
		{
			$path = $this->system_model->userDir() . $this->input->post('rename_dir_path');

			$path_parts = pathinfo($path);
            $basename = $path_parts['basename'];

			$dest_dirname = $path_parts['dirname'] . '/' . $this->input->post('rename_new_name');
			$dest = $path_parts['dirname'];

            $str = $this->input->post('copy_of');

			if(file_exists($dest_dirname) && $this->input->post('rename_overwrite') === 'false') {
            	for($i = 1; ;$i++)
            	{     		
            		if(!file_exists($dest . '/' . $str . $this->input->post('rename_new_name') . ' [' . $i . '].'))
            		{
            			if($data = @rename($path, $dest . '/' . $str . $this->input->post('rename_new_name') . ' [' . $i . '].')) break;
            		}
            	}
            }
            else 
            {
            	$data = @rename($path, $dest_dirname);
            }
		}
		else
		{
			$data = FALSE;
		}
		echo json_encode($data);
	}

}