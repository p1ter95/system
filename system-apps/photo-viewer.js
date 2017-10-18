var viewer = new Application('Photo Viewer');

viewer.resizeWindow = function(width, height, targetWidth, targetHeight) {
	var targetRatio = targetWidth / targetHeight;
	var sourceRatio = width / height;
	if(sourceRatio >= targetRatio) {
	    var requiredWidth = targetWidth;
	    var requiredHeight = requiredWidth / sourceRatio;
	}
	else {
	    var requiredHeight = targetHeight;
	    var requiredWidth = requiredHeight * sourceRatio;
	}
	return { width: requiredWidth, height: requiredHeight };
};

viewer.getFileFromDirectory = function(next, callback) {
	if(this.currentFilePath !== undefined) {
		var dirPath = System.API.uri.getPathWithoutFileName(this.currentFilePath) == '' ? '' : System.API.uri.getPathWithoutFileName(this.currentFilePath) + '/';
		System.API.fileSystem.directory.getFilenames(System.API.uri.trimTrailingSlash(dirPath), function(r) {
			if(r) {
				var files = [];
				for(var file in r) {
					let index = this.supportedFileTypes.indexOf(System.API.uri.getExtension(r[file]));
					if(index !== -1) {
						files.push(r[file]);
					}
				}
				if(files.length > 1) {
					var currentFileIndex = files.indexOf(System.API.uri.getFileName(this.currentFilePath));
					if(currentFileIndex !== -1) {
						if(next) {
							if(currentFileIndex == files.length - 1) callback(dirPath + files[0]);
							else
								callback(dirPath + files[currentFileIndex  + 1]);
						}
						else {
							if(currentFileIndex  == 0) callback(dirPath + files[files.length - 1]);
							else
								callback(dirPath + files[currentFileIndex  - 1]);
						}
					}
				}
			}
		}.bind(this));
	}
}

openImage = function(path) {
	if(path !== undefined) {
		this.window.image.setAttribute('src', this.fileSystem.file.get(path));
		this.window.setCaption(this.uri.getFileName(path));
		this.currentFilePath = path;
	}
	this.image.getDimensions(path, function (r) {
		var addedWidth = this.window.getWidth() - this.window.getInnerWidth();
		var addedHeight = (this.window.getHeight() - this.window.getInnerHeight()); //fix 
		var width = r.width + addedWidth;
		var height = r.height + addedHeight;
		if(width > System.desktop.window.width() || height > System.desktop.field.getHeight()) {
			var lol = this.resizeWindow(width, height, System.desktop.window.width(), System.desktop.field.getHeight());
			width = lol.width;
			height = lol.height;
			this.window.image.setWidth(width - addedWidth);
			this.window.image.setHeight(height - addedHeight);
		}
		this.window.image.setWidth(width - addedWidth);
		this.window.image.setHeight(height - addedHeight);
		this.window.setWidth(width);
		this.window.setDimensions(width, height);
		this.window.setMinWidth(width);
		this.window.setMinHeight(height);
		this.window.centerToScreen();
	}.bind(this));

	/*this.window.addEvent('resize', function(e, ui) {
        app.setSettingsItems({
            width: ui.size.width,
            height: ui.size.height
        });
    });*/
};

viewer.open = openImage;

designer = function() {
	var app = this.app;
    var self = this;
	this.menu = new MenuStrip({
		File: [
		{
			label: 'Open',
			action: function() { 
				app.openFileDialog(function(r) {
					openImage.call(app, r); 
				}, {'Pliki graficzne': app.supportedFileTypes.join('|'), 'mp4': 'mp4', 'Wszystkie pliki': '*'}); 
			}
		},
		{
			label: 'Save', 
			action: function() { 
				app.openFileDialog(function(r) {
					openImage.call(app, r); 
				}, {'Pliki graficzne': 'bmp|gif|jpg|png', 'mp4': 'mp4', 'Wszystkie pliki': '*'}, undefined, true); 
			}
		}
		],
		test1: [{label: 'gdfg'}],
		test22222222222222: [{label: 'gre45'}]
	})
	this.addItem(this.menu);
	this.image = new Element('img', 0, 0);
	this.addItem(this.image);
};

viewer.main = function () {
    this.window = new Window(this.name, 500, 500);
	this.window.designer = designer;
	this.addWindow(this.window);
	this.window.setMainWindow();
	this.window.open();
	this.supportedFileTypes = ['jpg', 'png', 'gif', 'bmp', 'ico'];

	var app = this;

	this.window.addShortcut('left', function() {
		app.getFileFromDirectory(false, function(r) {
			app.open(r);
		});
	});
	this.window.addShortcut('right', function() {
		app.getFileFromDirectory(true, function(r) {
			app.open(r);
		});
	});
	openImage.call(this);
};

System.ApplicationManager.load(viewer);