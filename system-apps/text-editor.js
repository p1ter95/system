var editor = new Application('Text Editor');

editor.onClose = function() {
	var app = this;
	if(this.modified) {
		this.messageBox('You have left ' + this.uri.getFileName(this.currentFilePath) + ' unsaved. Do you wish to save this file before closing application?', 'warning', undefined, 
			[new Button('Yes', 0, 0, function() {
				app.saveFile(app.currentFilePath);
				app.exit();
			}),
			new Button('No', 0, 0, function() {
				app.modified = false;
				app.exit();
			}),
			new Button('Cancel', 0, 0)]
		);
	}
	else
		app.exit();
};

editor.openFile = function(path) {
	if(path !== undefined) {
		this.fileSystem.file.read(path, function(r) {
			this.window.textarea.setValue(r);
			this.window.setCaption(this.uri.getFileName(path));
			this.currentFilePath = path;
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

editor.saveOption = function() {
	var app = this;
	if(this.currentFilePath !== '') {
		this.saveFile(this.currentFilePath);
	}
	else {
		this.saveFileDialog(function(r) {
			console.log(r);
			app.saveFile(r);
		}, {'Text file': 'txt', 'JavaSript file': 'js', 'All files': '*'}, app.currentFilePath !== '' ? app.uri.getPathWithoutFileName(app.currentFilePath) : undefined); 
	}
}

editorDesigner = function() {
	var app = this.app;
    var self = this;
	this.menu = new MenuStrip({
		File: [
		{
			label: 'New',
			action: function() {
				app.currentFilePath = '';
				self.setCaption('New file');
				self.textarea.setValue('');
				app.modified = false;
			}
		},
		{
			label: 'Open',
			action: function() { 
				app.openFileDialog(function(r) {
					console.log(r);
					app.openFile.call(app, r);
				}, {'Text files': 'txt|js|json|bat', 'All files': '*'}, app.currentFilePath !== '' ? app.uri.getPathWithoutFileName(app.currentFilePath) : undefined);
			}
		},
		{
			label: 'Save',
			shortcut: 'Ctrl+S',
			action: app.saveOption.bind(app)
		},
		{
			label: 'Save As...',
			action: function() {
				app.saveFileDialog(function(r) {
					console.log(r);
					app.saveFile(r);
				}, {'Text file': 'txt', 'JavaSript file': 'js', 'All files': '*'}, app.currentFilePath !== '' ? app.uri.getPathWithoutFileName(app.currentFilePath) : undefined); 
			}
		},
		{
			label: 'Exit',
			shortcut: 'F4',
			action: function() {
				app.close();
			}
		}
		],
		Format: [
		{
			label: 'Word wrap',
			checked: app.getSettingsItem('wordWrap'),
			onCheck: function() {
				self.textarea.setWordWrap(true);
				app.setSettingsItem('wordWrap', true);
			},
			onUnCheck: function() {
				self.textarea.setWordWrap(false);
				app.setSettingsItem('wordWrap', false);
			}
		}
		]
	})
	this.addItem(this.menu);
	this.textarea = new Textarea(0, 0, 5, 5);
	this.textarea.fillWindow();
	this.textarea.addEvent('input propertychange', function() {
		self.setCaption(app.currentFilePath !== '' ? app.uri.getFileName(app.currentFilePath) + '*' : 'New file*');
		app.modified = true;
	});
	this.textarea.resizeToWindow = true;
	this.textarea.setWordWrap(app.getSettingsItem('wordWrap'));
	this.addItem(this.textarea);
	this.textarea.setFocus();
}

editor.main = function () {
	this.currentFilePath = '';
	this.modified = false;
    this.window = new Window(this.name, System.desktop.window.width() / 2, System.desktop.window.height() / 1.5);
	this.addWindow(this.window);
	this.window.designer = editorDesigner;
	this.window.setMainWindow();
	this.window.open();

	this.window.addShortcut('ctrl+s', this.saveOption.bind(this)); //FIX

	//openImage.call(this);
}

System.ApplicationManager.load(editor);