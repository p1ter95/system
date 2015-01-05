explorer = new Application('Explorer');

explorer.main = function () {
    var data = this;

    var desktop = System.desktop;

    
    /*data.getFilenames('desktop', false, false, function (r) {
        if (success(r)) {
            for (var i = 0; i < r.data.length; i++) {
                var file = r.data[i];
                desktop.field.addItem(new Item(file, file, '', (function (s) {
                    return function () { 
                        data.openFile(s);
                    };
                })(file)));
            }
        }
    });*/

    data.getDirFileInfo('desktop', true, false, function (r) {
        if (success(r)) {
            var arr = [];
            for (key in r.data) {
                arr.push(new Item(r.data[key].name, getUserPathByRelativePath(r.data[key].relative_path, true) + r.data[key].name, bytesToSize(r.data[key].size), (function (s) {
                    return function () {
                        data.openFile(s);
                    };
                })(getUserPathByRelativePath(r.data[key].relative_path, true) + r.data[key].name)));
            }
            desktop.field.setItems(arr);
        }
    });
    
    var run = new Window('Run', 400, 160);
    run.height = 150;
    run.width = 400;
    run.setMainWindow();
    this.addWindow(run);
    var input = new Input('text', 20, 15, 'app-name', '', { lolsdsd: 'xd' });
    run.addItem(input)
    var runButton = new Button('Run', 210, 15, function () { data.ApplicationManager.run(data.ApplicationManager.getApplicationByName(input.getValue())); });
    run.addItem(runButton)

    var runListButton = new Button('Run', 210, 50, function () { data.ApplicationManager.run(data.ApplicationManager.getApplicationByName(appList.getSelected().value)); });
    run.addItem(runListButton)

    var arrAppList = [];
    for (var i = 0; i < System.Applications.length; i++) {
        arrAppList.push(new Option(System.Applications[i].name, System.Applications[i].name));
    }
    var appList = new List(arrAppList, 20, 50);
    run.addItem(appList);

    this._upload = new Window('Upload', 400, 200);
    this.addWindow(this._upload);

    this._upload.designer = function () {
        var self = this;
        this.uploadInput = new Input('file', 15, 15, 'userfile');
        this.uploadBtn = new Button('Upload', 15, 100, function () { data.upload(self.uploadPath.getValue()); });
        this.uploadPath = new Input('text', 15, 60);
        this.uploadProgress = new Element('progress', 15, 140, { value: 0, max: 1 });
        this.uploadProgress.e.attr('id', 'system-upload-progress');
        //this.e.append('<form id="lol" method="post" enctype="multipart/form-data"></form>');
        //this.e.children('#lol').append(this.uploadInput.e)
        this.addItem(this.uploadInput);
        this.addItem(this.uploadBtn);
        this.addItem(this.uploadPath);
        this.addItem(this.uploadProgress);
    }

    run.open();
    this._upload.open();
}



System.ApplicationManager.load(explorer);