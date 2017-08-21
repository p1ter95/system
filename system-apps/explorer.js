﻿explorer = new Application('Explorer');

uploadDesigner = function () {
    var self = this;
    var app = this.app;

    this.uploadInputDisk = new Input('file', 15, 15, 'userfiles[]', undefined, {multiple: 'multiple'});
    this.destinationLabelDisk = new Label(System.Lang.explorer.uploadApp.destination, 15, 66);
    this.browseDestinationDisk = new Button(System.Lang.explorer.uploadApp.browse, 285, 60, function () {
        app.browseDirectoryDialog(function (r) { self.uploadPathDisk.setValue(r) });
    });
    this.uploadPathDisk = new Input('text', 95, 60);
    this.overwriteLabelDisk = new Label(System.Lang.explorer.uploadApp.overwrite, 15, 95);
    this.uploadOverwriteDisk = new Input('checkbox', 97, 95);
    this.uploadBtnDisk = new Button(System.Lang.explorer.uploadApp.uploadBtn, 15, 120, function () {
        app.fileSystem.file.uploadFromDisk(self.uploadPathDisk.getValue(), self.uploadInputDisk, self.uploadProgress, self.uploadOverwriteDisk.checked(), function (r) {
            if (success(r)) {
                app.messageBox(System.Lang.explorer.uploadApp.success, 'tick');
            }
            else {
                app.messageBox(System.Lang.explorer.uploadApp.fail + showMessage(r), 'error');
                self.uploadProgress.e.attr({ value: 0, max: 1 });
            }
        });
    });
    this.uploadProgress = new Element('progress', 15, 160, undefined, { value: 0, max: 1 });
    this.uploadProgress.e.attr('id', 'system-upload-progress');

    this.inputLabelUrl = new Label('URL', 15, 19);
    this.uploadInputUrl = new Input('text', 50, 15);
    this.destinationLabelUrl = new Label(System.Lang.explorer.uploadApp.destination, 15, 66);
    this.browseDestinationUrl = new Button(System.Lang.explorer.uploadApp.browse, 285, 60, function () {
        app.browseDirectoryDialog(function (r) { self.uploadPathUrl.setValue(r) });
    });
    this.uploadPathUrl = new Input('text', 95, 60);
    this.overwriteLabelUrl = new Label(System.Lang.explorer.uploadApp.overwrite, 15, 95);
    this.overwriteUrl = new Input('checkbox', 97, 95);
    this.uploadBtnUrl = new Button(System.Lang.explorer.uploadApp.uploadBtn, 15, 130, function () {
        if (self.uploadInputUrl.getValue() != '') {
            app.fileSystem.file.uploadFromUrl(self.uploadInputUrl.getValue(), self.uploadPathUrl.getValue(), self.overwriteUrl.checked(), function (r) {
                if (success(r)) {
                    app.messageBox(System.Lang.explorer.uploadApp.success, 'tick');
                }
                else {
                    app.messageBox(System.Lang.explorer.uploadApp.fail + showMessage(r), 'error');
                }
            });
        }
    });

    //this.e.append('<form id="lol" method="post" enctype="multipart/form-data"></form>');
    //this.e.children('#lol').append(this.uploadInput.e)
    this.diskTab = new Tab(System.Lang.explorer.uploadApp.diskMethod);
    this.urlTab = new Tab(System.Lang.explorer.uploadApp.urlMethod);

    this.diskTab.addItem(this.uploadBtnDisk);
    this.diskTab.addItem(this.destinationLabelDisk);
    this.diskTab.addItem(this.browseDestinationDisk);
    this.diskTab.addItem(this.uploadPathDisk);
    this.diskTab.addItem(this.uploadProgress);
    this.diskTab.addItem(this.uploadOverwriteDisk);
    this.diskTab.addItem(this.overwriteLabelDisk);
    this.diskTab.addItem(this.uploadInputDisk);

    this.urlTab.addItem(this.inputLabelUrl);
    this.urlTab.addItem(this.destinationLabelUrl);
    this.urlTab.addItem(this.browseDestinationUrl);
    this.urlTab.addItem(this.uploadPathUrl);
    this.urlTab.addItem(this.uploadInputUrl);
    this.urlTab.addItem(this.overwriteLabelUrl);
    this.urlTab.addItem(this.overwriteUrl);
    this.urlTab.addItem(this.uploadBtnUrl);

    this.tabs = new Tabs(10, 10, 380, 190, [this.diskTab, this.urlTab]);

    this.addItem(this.tabs);
}

runDesigner = function () {
    var self = this;
    var app = this.app;
    this.input = new Input('text', 20, 15, 'app-name', '');
    this.runBtn = new Button(System.Lang.explorer.runApp.runBtn, 210, 15, function () {
        var args = self.argsInput.getValue() != '' ? JSON.parse(self.argsInput.getValue()) : undefined;
        if (self.input.getValue() != '') explorer.ApplicationManager.runByName(self.input.getValue(), args);
    });
    this.runListBtn = new Button(System.Lang.explorer.runApp.runListBtn, 210, 50, function () {
        var args = self.argsInput.getValue() != '' ? JSON.parse(self.argsInput.getValue()) : undefined;
        app.ApplicationManager.runByName(self.appList.getSelected().value, args);
    }, undefined, app.currentPath + 'file.png');
    var appList = {};
    for (var i = 0; i < System.Applications.length; i++) {
        appList[System.Applications[i].displayName] = System.Applications[i].name;
    }
    this.appList = new List(appList, 20, 50);
    this.argsInput = new Input('text', 20, 83);
    this.runBtn.setFocus();
    this.addItem(this.appList);
    this.addItem(this.input);
    this.addItem(this.runBtn);
    this.addItem(this.runListBtn);
    this.addItem(this.argsInput);
}

function populate(r) {
    var arr = [];
    var app = this.app;
    var self = this;
    if (r) {
        for (var key in r) {
            var item = new Item({ name: r[key].name, path: app.uri.getUserDirectory(r[key].relative_path, true) + r[key].name, size: bytesToSize(r[key].size) }, (function (s) {
                return function () {
                    if (app.uri.isFile(s)) {
                        app.fileSystem.file.open(s);
                    }
                    else {
                        app.fileSystem.directory.getFilesInfo(s, true, populate.bind(self));
						if(self.currentPath !== undefined) self.currentPath.setValue(s);
                        self.setCaption(s !== '' ? app.uri.getDirectoryName(s) : System.Lang.explorer.fileExplorer.caption);
                    }
                };
            })(app.uri.getUserDirectory(r[key].relative_path, true) + r[key].name));
            item.e.css('background-image', getIconByFileExtension(app.uri.getExtension(r[key].name)));
            item.addTooltip('<div>' + System.Lang.explorer.fileExplorer.fileName + ': ' + r[key].name + '</div>' + (app.uri.isFile(r[key].name) ? '<div>' + System.Lang.explorer.fileExplorer.fileSize + ': ' + bytesToSize(r[key].size) : '') + '</div><div>' + System.Lang.explorer.fileExplorer.fileModDate + ': ' + new Date(r[key].date * 1000).toUTCString());
            //if(app.uri.isFile(r[key].name)) item.addContextMenu(System.desktop.fileContextMenu, {filePath: app.uri.getUserDirectory(r[key].relative_path, true) + r[key].name, _window: self, itemField: self.field});
            System.desktop.addContextMenu(item, {filePath: app.uri.getUserDirectory(r[key].relative_path, true) + r[key].name, _window: self, itemField: self.field});
            arr.push(item);
        }
    }
    this.field.setItems(arr);
}

explorer.refresh = function(_window) {
    explorer.fileSystem.directory.getFilesInfo(_window.currentPath.getValue(), true, populate.bind(_window));
}

explorer.openPath = function(path, forceNewWindow) {
    var app = this;
    var alreadyOpened = false;
    if(!forceNewWindow === true) {
        for(var i = 0; i < app.windows.length; i++) {
            if(app.windows[i].currentPath !== undefined && app.windows[i].currentPath.getValue() == path) {
                if(app.windows[i].minimized) app.windows[i].unminimize();
                app.windows[i].setFocus();
                alreadyOpened = true;
            }
        }
    }
    if(!alreadyOpened) {
        var _window = new Window(path !== '' ? app.uri.getDirectoryName(path) : System.Lang.explorer.fileExplorer.caption, 620, 500);
        //_window.defaultSize = {width: 620, height: 500};
        _window.destroyOnClose = true;
        this.addWindow(_window);
        _window.currentPath = new Input('text', 15, 15, undefined, path);
        _window.currentPath.setWidth(300);
        _window.field = new ItemField(15, 60, 500, 370, { tiles: '<div class="text">{name}<span class="size">{size}</span></div>' , list: '<div class="text">{name}<span class="size">{size}</span></div>' }, app.getSettingsItem('view'));
        _window.field.resizeToWindow = true;
        _window.goBtn = new Button(System.Lang.explorer.fileExplorer.go, 330, 15, function () {
            app.fileSystem.directory.getFilesInfo(_window.currentPath.getValue(), true, populate.bind(_window));
            _window.setCaption(_window.currentPath.getValue() !== '' ? app.uri.getDirectoryName(_window.currentPath.getValue()) : System.Lang.explorer.fileExplorer.caption);
        });
        _window.upBtn = new Button(System.Lang.explorer.fileExplorer.upOneLevel, 375, 15, function () {
            if(_window.currentPath.getValue() != '') {
                var _path = app.uri.upOneLevel(_window.currentPath.getValue());
                app.fileSystem.directory.getFilesInfo(_path, true, populate.bind(_window));
                _window.currentPath.setValue(_path);
                _window.setCaption(_path !== '' ? app.uri.getDirectoryName(_path) : System.Lang.explorer.fileExplorer.caption);
            }
        });
        _window.viewLabel = new Label(System.Lang.explorer.fileExplorer.view, 525, 60);
        _window.viewLabel.anchored = true;
        _window.tileViewLabel = new Label(System.Lang.explorer.fileExplorer.tileView, 550, 75);
        _window.tileViewLabel.anchored = true;
        _window.listViewLabel = new Label(System.Lang.explorer.fileExplorer.listView, 550, 90);
        _window.listViewLabel.anchored = true;
        _window.tileViewRadio = new Input('radio', 525, 75, 'view-radio' + _window.getId(), 'tiles', app.getSettingsItem('view') == 'tiles' ? {checked: ''} : {});
        _window.tileViewRadio.anchored = true;
        _window.listViewRadio = new Input('radio', 525, 90, 'view-radio' + _window.getId(), 'list', app.getSettingsItem('view') == 'list' ? {checked: ''} : {});
        _window.listViewRadio.anchored = true;
        _window.addItem(_window.currentPath);
        _window.addItem(_window.field);
        _window.addItem(_window.goBtn);
        _window.addItem(_window.upBtn);
        _window.addItem(_window.viewLabel);
        _window.addItem(_window.tileViewLabel);
        _window.addItem(_window.listViewLabel);
        _window.addItem(_window.tileViewRadio);
        _window.addItem(_window.listViewRadio);

        _window.setInputHandler('view-radio' + _window.getId(), 'change', function() {
            _window.field.setView(_window.getSelectedInputValue('view-radio' + _window.getId()));
            app.setSettingsItem('view', _window.getSelectedInputValue('view-radio' + _window.getId()));
        });
        
        app.fileSystem.directory.getFilesInfo(path, true, populate.bind(_window));
        _window.addEvent('resizestop', function(e, ui) {
            app.setSettingsItems({
                width: ui.size.width,
                height: ui.size.height
            });
        });
        _window.open();
    }
}

explorer.main = function (r) {
    var data = this;
    var desktop = System.desktop;

    this.run = new Window(System.Lang.explorer.runApp.caption, 400, 160);
    this.run.allowResizing = false;
    
    this.addWindow(this.run);
	this.run.setMainWindow();
    this.run.designer = runDesigner;

    this._upload = new Window(System.Lang.explorer.uploadApp.caption, 415, 295);
    this._upload.allowResizing = false;
    this.addWindow(this._upload);
    this._upload.designer = uploadDesigner;

    this.openPath('');

    data.fileSystem.directory.getFilesInfo('desktop', true, function (r) {
        if (r) {
            var arr = [];
            for (key in r) {
                var item = new Item({ name: r[key].name, path: data.uri.getUserDirectory(r[key].relative_path, true) + r[key].name, size: bytesToSize(r[key].size) }, (function (s) {
                    return function () {
                        if (data.uri.isFile(s)) {
                            data.fileSystem.file.open(s);
                        }
                        else {
                            data.openPath(s);
                        }
                    };
                })(data.uri.getUserDirectory(r[key].relative_path, true) + r[key].name));
                item.e.css('background-image', getIconByFileExtension(data.uri.getExtension(r[key].name)));
                item.addTooltip('<div>' + System.Lang.explorer.fileExplorer.fileName + ': ' + r[key].name + '</div>' + (data.uri.isFile(r[key].name) ? '<div>' + System.Lang.explorer.fileExplorer.fileSize + ': ' + bytesToSize(r[key].size) : '') + '</div><div>' + System.Lang.explorer.fileExplorer.fileModDate + ': ' + new Date(r[key].date * 1000).toUTCString());
                arr.push(item);
            }
            desktop.field.setItems(arr);
        }  
    });

    this.run.open();
    this._upload.open();
}

System.ApplicationManager.load(explorer);