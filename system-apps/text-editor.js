var editor = new Application('Text Editor');

editor.onClose = function() {
	var app = this;
	if(this.modified) {
		this.messageBox('You left ' + this.uri.getFileName(this.currentFile) + ' unsaved. Do you wish to save this file before closing application?', 'warning', undefined, 
			[new Button('Yes', 0, 0, function() {
				app.saveFile(app.currentFile);
				System.ProcessManager.killProcess(app.processId);
			}),
			new Button('No', 0, 0, function() {
				app.modified = false;
				System.ProcessManager.killProcess(app.processId);
			}),
			new Button('Cancel', 0, 0, function() {
				
			})]
		);
	}
	else
		System.ProcessManager.killProcess(app.processId);
};

editor.openFile = function(path) {
	if(path !== undefined) {
		this.fileSystem.file.read(path, function(r) {
			this.window.textarea.setValue(r);
			this.window.setCaption(this.uri.getFileName(path));
			this.currentFile = path;
			this.modified = false;
		}.bind(this));
	}
}

editor.open = editor.openFile;

editor.saveFile = function(path) {
	this.fileSystem.file.write(path, this.window.textarea.getValue());
	this.window.setCaption(this.uri.getFileName(path));
	this.modified = false;
}

editorDesigner = function() {
	var app = this.app;
    var self = this;
	this.menu = new MenuStrip({
		File: [
		{
			label: 'New', 
			action: function() {
				app.currentFile = '';
				self.setCaption('New file');
				self.textarea.setValue('');
				self.modified = false;
			}
		},
		{
			label: 'Open', 
			action: function() { 
				app.openFileDialog(function(r) {
					console.log(r);
					app.openFile.call(app, r);
				}, {'Text files': 'txt|js|json|bat', 'All files': '*'});
			}
		},
		{
			label: 'Save', 
			action: function() { 
				if(app.currentFile !== '') {
					app.saveFile(app.currentFile);
				}
				else
					app.saveFileDialog(function(r) {
						console.log(r);
						app.saveFile(r);
					}, {'Text file': 'txt', 'JavaSript file': 'js', 'All files': '*'}); 
			}
		},
		{
			label: 'Save As...', 
			action: function() { 
				app.saveFileDialog(function(r) {
					console.log(r);
					app.saveFile(r);
				}, {'Text file': 'txt', 'JavaSript file': 'js', 'All files': '*'}); 
			}
		},
		{
			label: 'Close', 
			action: function() {
				app.close();
			}
		}
		]
	})
	this.addItem(this.menu);
	this.textarea = new Textarea(0, this.menu.getHeight(), 5, 5);
	this.textarea.e.css('height', this.getInnerHeight() - this.menu.getHeight());
	this.textarea.e.css('width', '100%');
	this.textarea.addEvent('input propertychange', function() {
		self.setCaption(app.currentFile !== '' ? app.uri.getFileName(app.currentFile) + '*' : 'New file*');
		app.modified = true;
	});
	this.textarea.resizeToWindow = true;
	this.addItem(this.textarea);
}

editor.main = function () {
	this.currentFile = '';
	this.modified = false;
    this.window = new Window(this.name, 1280, 720);
	this.addWindow(this.window);
	this.window.designer = editorDesigner;
	this.window.setMainWindow();
	this.window.open();

	//openImage.call(this);
}

System.ApplicationManager.load(editor);