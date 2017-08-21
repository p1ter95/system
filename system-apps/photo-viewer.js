var viewer = new Application('Photo Viewer');

openImage = function(path) {
	if(path !== undefined) {
		this.window.image.setAttribute('src', this.fileSystem.file.get(path));
		this.window.setCaption(this.uri.getFileName(path));
	}
	else this.window.image.setAttribute('src', this.fileSystem.file.get('desktop/lel2/xd.jpg'));
	setTimeout(function() {
		var width = this.window.image.getWidth() + (this.window.getWidth() - this.window.getInnerWidth());
		var height = this.window.image.getHeight() + this.window.menu.getHeight() + (this.window.getHeight() - this.window.getInnerHeight());
		this.window.setWidth(width); 
		this.window.setHeight(height); 
		this.window.setMinWidth(width);
		this.window.setMinHeight(height);
		this.window.centerToScreen();
	}.bind(this), 150);
}

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
				}, {'Pliki graficzne': 'bmp|gif|jpg|png', 'mp4': 'mp4', 'Wszystkie pliki': '*'}); 
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
		heeeeeeeeh: [{label: 'no co tty'}],
		heeeeeeeeh2: [{label: 'no co tty'}]
	})
	this.addItem(this.menu);
	this.image = new Element('img', 0, this.menu.getHeight());
	this.addItem(this.image);
}

viewer.main = function () {
    this.window = new Window(this.name, 500, 500);
	this.window.designer = designer;
	this.addWindow(this.window);
	this.window.setMainWindow();
	this.window.open();

	openImage.call(this);
}

System.ApplicationManager.load(viewer);