//EXTENDING STRING PROTOTYPE

String.prototype.format = function () {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

String.prototype.formatObject = function (tokens) {
    var formatted = this;
    for (var token in tokens) {
        formatted = formatted.replace(RegExp('{' + token + '}', 'g'), tokens[token]);
    }
    return formatted;
};

String.prototype.replaceAll = function (find, replace) {
    return this.replace(new RegExp(find, 'g'), replace);
};

RegExp.escape = function (str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/*==============================================================
MISC HELPER FUNCTIONS
===============================================================*/

function bool(val) {
    if (insensitiveComparison(val, 'true')) {
        return true;
    }
    else if (insensitiveComparison(val, 'false')) {
        return false;
    }
    else {
        return true;
    }
}

function showMessage(r) {
    var text = '';
    if (r.message !== undefined) {
        var errors = r.message;
        if (typeof errors === 'object') {
            for (var key in errors) {
                text += '<div>' + errors[key] + '</div>';
            }
        }
        else {
            text = '<div>' + errors + '</div>';
        }
    }
    return text;
}

function success(r) {
    return bool(r.success);
}

function insensitiveComparison(str1, str2) {
    return str1.toUpperCase() == str2.toUpperCase();
}

function bytesToSize(bytes) {
    if (bytes === 0) return '0 ' + System.Lang.fileSystem.bytes;
    var k = 0;
    var sizes = [];
    switch (System.Settings.fileSystem.fileSizeUnits) {
        default:
        case 'decimal':
            k = 1000;
            sizes = [System.Lang.fileSystem.bytes, 'KB', 'MB', 'GB', 'TB'];
            break;
        case 'binary':
            k = 1024;
            sizes = [System.Lang.fileSystem.bytes, 'KiB', 'MiB', 'GiB', 'TiB'];
            break;
    }
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes < k ? bytes : (bytes / Math.pow(k, i)).toPrecision(3)) + ' ' + sizes[i];
}

function getHighestZIndex() {
	var arr = [];
	$('.window').each(function() {
		arr.push(parseInt($(this).css('z-index')));
	});
    var max = Math.max.apply(Math, arr);
    return max;
}

function getScriptPath() {
    var path = document.currentScript.src.split('/').slice(0, -1).join('/') + '/';
    var index = path.indexOf('users');
    return index !== -1 ? path.slice(index).split('/').slice(2).join('/') : path;
}

function isContextMenuVisible() {
    var visible = false;
    $('.contextmenu').each(function() {
        if($(this).css('display') == 'block') visible = true;
    });
    return visible;
}

function getIconByFileExtension(extension) {
    if(extension == '')
        return 'url(' + System.Presets.resourcesPath + 'fileicons/folder.png)';
    else if(supportedFileIcons.indexOf(extension) != -1){
        return 'url(' + System.Presets.resourcesPath + 'fileicons/' + extension + '.png)';
    }
    else {
        return 'url( ' + System.Presets.resourcesPath + 'fileicons/file.png)';
    }
}

/*==============================================================
SYSTEM
===============================================================*/

var System = {};

System.Presets = {};
System.SettingsManager = {};
System.ProcessManager = {idCounter: 0};
System.ApplicationManager = {};
System.ServicesManager = {};
System.WindowManager = {};
System.LocalizationManager = {};
System.IOManager = { mouse: {} };
System.desktop = {};
System.Applications = [];
System.Processes = [];
System.Services = [];

System.Init = function () {
    this.Presets.init();
    this.SettingsManager.init();
    this.LocalizationManager.init();
    this.IOManager.init();
    this.WindowManager.init();
    this.desktop.init();
    System.SettingsManager.load();
};

System.SettingsManager.init = function () {
    System.Settings = {
        fileSystem: {
            fileSizeUnits: 'decimal',
            sortDirectoriesBeforeFiles: true
        },
        desktop: {
            defaultWindowDimensions: {
                width: 640,
                height: 480
            },
            defaultTooltipDelay: 300,
            windowFadeInTime: 200,
            windowFadeOutTime: 200,
            tooltipFadeTime: 150,
            taskbarPosition: 'bottom',
            taskbarItemWidth: 100,
            taskbarBackground: new Color(242, 242, 242, 0.7),
            taskbarDateFormat: '{day}.{month}.{year}',
            taskbarTimeFormat: '{hours}:{minutes}',
            refreshRate: 5,
            backgroundPath: System.Presets.wallpapersPath + 'wallpaper1.jpg',
            defaultBrowseDialogPath: ''
        },
        applications: {
            autorun: [],
            installed: ['Explorer', 'Login', 'Photo Viewer', 'Text Editor'],
            refreshRate: 5,
            settings: {
                Explorer: {
                    view: 'list'
                }
            }
        },
        services: {
            autorun: [],
            defaultFrequency: 1
        },
        sources: [
            { filePath: System.Presets.systemApplicationsPath + 'refresh.js', appsAmount: 2 },
            { filePath: System.Presets.systemApplicationsPath + 'explorer.js', appsAmount: 1 },
            { filePath: System.Presets.systemApplicationsPath + 'login.js', appsAmount: 1 },
            { filePath: System.Presets.systemApplicationsPath + 'photo-viewer.js', appsAmount: 1 },
            { filePath: System.Presets.systemApplicationsPath + 'text-editor.js', appsAmount: 1 },
            { filePath: System.Presets.languagesPath + 'english.js', appsAmount: 1 }
        ],
        defaultLanguage: 'English',
        language: 'English',
        associatedFileExtensions: {
            'jpg': 'Photo Viewer',
            'gif': 'Photo Viewer',
            'png': 'Photo Viewer',
            'txt': 'Text Editor',
            'js': 'Text Editor',
            'json': 'Text Editor',
            'bat': 'Text Editor'
        }
    };
    System.SettingsManager.allSourcesApps = 0;
    System.SettingsManager.loadedSourcesApps = 0;
    System.SettingsManager.autorunDone = false;
};

System.Presets.init = function () {
    System.Presets.OSName = 'System';
    System.Presets.OSVersion = 0.01;
    System.Presets.filesController = 'files/';
    System.Presets.usersController = 'members2/';
    System.Presets.systemApplicationsPath = '/system-apps/';
    System.Presets.languagesPath = '/lang/';
    System.Presets.resourcesPath = '/res/';
    System.Presets.wallpapersPath = System.Presets.resourcesPath + 'wallpapers/';
    System.Presets.serverPathDropSegments = 2;
};

var Process = function (app, runBy) {
    this.id = System.ProcessManager.getFreeId();
    if(app.repeat == undefined) {
        this.app = app;
        this.app.processId = this.id;
    }
    else {
        this.service = app;
        this.service.processId = this.id;
    }
    this.runBy = runBy;
};

var Application = function (name) {
    this.name = name;
    this.displayName = name;
    this.info = {};
    this.info.description = 'Unknown';
    this.info.version = 1;
    this.info.author = 'Unknown';
    this.info.url = 'Unknown';
    this.info.language = 'Unknown';
	this.mainWindow = undefined;
    this.windows = [];
	this.allowMultipleInstances = false;
    this.currentPath = getScriptPath();

    this.main = function () { };
};

var Service = function (name, frequency) {
    this.name = name;
    this.running = false;
    this.timeoutId = 0;
    this.main = function () { };
    this.loop = function () { };
    this.repeat = function () {
        this.loop();
        this.timeoutId = setTimeout(this.repeat.bind(this), 1000 / this.frequency); //CONSIDER REWRITING TO PROTOTYPE
    };
    this.frequency = frequency !== undefined ? frequency : System.Settings.services.defaultFrequency;
    this.currentPath = getScriptPath();
};

System.API = Application.prototype;
Service.prototype = Application.prototype;

/*==============================================================
SETTINGS MANAGER
===============================================================*/

System.SettingsManager.addSource = function (filePath, appsAmount) {
    var fileName = System.API.uri.getFileName(filePath);
    var installed = false;
    for (var i = 0; i < System.Settings.sources.length; i++) {
        if (System.Settings.sources[i].filePath == filePath) {
            installed = true;
            System.API.desktopMessageBox(System.Lang.settings.sourceAlreadyAdded.formatObject({ fileName: fileName }), 'error');
            break;
        }
    }
    if (!installed) {
        System.API.user.isLoggedIn(function (r) {
            if (r) {
                System.SettingsManager.loadFile(filePath, function (r) {
                    if (r) {
                        System.Settings.sources.push({ filePath: filePath, appsAmount: appsAmount !== undefined ? appsAmount : 1 });
                        System.SettingsManager.save();
                        System.API.desktopMessageBox(System.Lang.settings.sourceAdded.formatObject({ fileName: fileName }), 'tick');
                    }
                    else {
                        System.API.desktopMessageBox(System.Lang.settings.sourceError, 'error');
                    }
                });
            }
            else {
                System.API.desktopMessageBox(System.Lang.desktop.messages.notLogged, 'error');
            }
        });
    }
};

System.SettingsManager.removeSource = function (filePath) {
    var fileName = System.API.uri.getFileName(filePath);
    var uninstalled = false;
    for (var i = 0; i < System.Settings.sources.length; i++) {
        if (System.Settings.sources[i].filePath == filePath) {
            var unloaded = false;
            $('head').children().each(function () {
                if ($(this).attr('data-source-path') == filePath) {
                    $(this).remove();
                    unloaded = true;
                    console.info(System.Lang.settings.sourceUnloaded.formatObject({ fileName: fileName }));
                }
            });
            if (!unloaded) System.API.desktopMessageBox(System.Lang.desktop.messages.notFound.formatObject({ what: fileName }), 'error');
            System.Settings.sources.splice(i, 1);
            System.SettingsManager.save();
            System.API.desktopMessageBox(System.Lang.settings.sourceRemoved.formatObject({ fileName: fileName }), 'tick');
            uninstalled = true;
            break;
        }
    }
    if (!uninstalled) System.API.desktopMessageBox(System.Lang.desktop.messages.notFound.formatObject({ what: fileName }), 'error');
};

System.SettingsManager.loadFile = function (filePath, callback) { //Rename to load source
    var fileName = System.API.uri.getFileName(filePath);
    var loaded = false;
    var external = false;
    $('head').children().each(function () {
        if ($(this).attr('data-source-path') == filePath) {
            console.error(fileName + ' is already loaded');
            loaded = true;
            if (callback !== undefined) callback(false);
        }
    });
    if(filePath.startsWith('/')) external = true;
    if (!loaded) {
        //LOADING FILE
        if(filePath.startsWith('http')) {
            var app = document.createElement('script');
            app.setAttribute('data-source-path', filePath);
            app.src = filePath;
            document.head.appendChild(app);
            console.info('[SOURCES] ' + fileName + ' loaded');
            if (callback !== undefined) callback(true);
        }
        else if (System.API.uri.isFile(filePath)) {
            if (System.API.uri.getExtension(filePath) == 'js') {
                var app = document.createElement('script');
                app.setAttribute('data-source-path', filePath);
                if (!external) {
                    System.API.fileSystem.file.exists(filePath, function (r) {
                        if (r) {
                            app.src = System.API.fileSystem.file.get(filePath);
                            document.head.appendChild(app);
                            console.info('[SOURCES] ' + fileName + ' loaded');
                            if (callback !== undefined) callback(true);
                        }
                        else {
                            console.error('Couldn\'t find ' + fileName);
                            if (callback !== undefined) callback(false);
                        }
                    });
                }
                else {
                    app.src = filePath;
                    document.head.appendChild(app);
                    console.info('[SOURCES] ' + fileName + ' loaded');
                    if (callback !== undefined) callback(true);
                }
            } else if (System.API.uri.getExtension(filePath) == 'css') {
                if (!external) {
                    System.API.fileSystem.file.exists(filePath, function (r) {
                        if (r) {
                            $('head').append('<link data-source-path=' + filePath + ' rel="stylesheet" href=' + System.API.fileSystem.file.get(filePath) + ' type="text/css" />');
                            console.info('[SOURCES] ' + fileName + ' loaded');
                            if (callback !== undefined) callback(true);
                        }
                        else {
                            console.error('Couldn\'t find ' + fileName);
                            if (callback !== undefined) callback(false);
                        }
                    });
                }
                else {
                    $('head').append('<link data-source-path=' + filePath + ' rel="stylesheet" href=' + filePath + ' type="text/css" />');
                    console.info('[SOURCES] ' + fileName + ' loaded');
                    if (callback !== undefined) callback(true);
                }
            }
            else {
                console.error('Couldn\'t load file with that file type');
                if (callback !== undefined) callback(false);
            }
        }
        //LOADING ALL FILES IN DIRECTORY
        else { //FIX TODO ELSE IF
            if (!external) {
                System.API.fileSystem.directory.getFilenames(filePath, false, function (r) {
                    if (r) {
                        for (var i = 0; i < r.length; i++) {
                            if (System.API.uri.getExtension(r[i]) == 'js') {
                                var app = document.createElement('script');
                                app.setAttribute('data-source-path', filePath);
                                app.src = System.API.fileSystem.file.get(filePath + '/' + r[i]);
                                document.head.appendChild(app);
                            }
                            else if (System.API.uri.getExtension(r[i]) == 'css') {
                                $('head').append('<link data-source-path=' + filePath + ' rel="stylesheet" href=' + System.API.fileSystem.file.get(filePath + '/' + r[i]) + ' type="text/css" />');
                            }
                        }
                        console.info('[SOURCES] ' + fileName + ' loaded');
                        if (callback !== undefined) callback(true);
                    }
                    else {
                        console.error('Couldn\'t find that directory');
                        if (callback !== undefined) callback(false);
                    }
                });
            }
            else {
                $.ajax({
                    type: 'POST',
                    data: { get_system_apps_filenames_path: filePath },
                    url: System.Presets.filesController + 'get_system_apps_filenames',
                    dataType: 'json',
                    cache: 'false',
                    success: function(r) {
                        if (r) {
                            for (var i = 0; i < r.length; i++) {
                                if (System.API.uri.getExtension(r[i]) == 'js') {
                                    var app = document.createElement('script');
                                    app.setAttribute('data-source-path', filePath);
                                    app.src = filePath + '/' + r[i];
                                    document.head.appendChild(app);
                                }
                                else if (System.API.uri.getExtension(r[i]) == 'css') {
                                    $('head').append('<link data-source-path=' + filePath + ' rel="stylesheet" href=' + filePath + '/' + r[i] + ' type="text/css" />');
                                }
                            }
                            console.info('[SOURCES] ' + fileName + ' loaded');
                            if (callback !== undefined) callback(true);
                        }
                        else {
                            console.error('Couldn\'t find that directory');
                            if (callback !== undefined) callback(false);
                        }
                    }
                });
            }
        }
    }
};

System.SettingsManager.loadSources = function () {
    for (let i = 0; i < System.Settings.sources.length; i++) {
        System.SettingsManager.allSourcesApps += System.Settings.sources[i].appsAmount !== undefined ? System.Settings.sources[i].appsAmount : 1;
    }
    for (let i = 0; i < System.Settings.sources.length; i++) {
        this.loadFile(System.Settings.sources[i].filePath);
    }
};

System.SettingsManager.load = function (callback) {
    System.API.fileSystem.file.read('settings.json', function (r) {
        if (r) {
            System.Settings = Save.parse(r);
            console.info('[SYSTEM] Settings file loaded');
        }
        System.SettingsManager.loadSources();
        if(callback !== undefined) callback();
    });
};

System.SettingsManager.removeKey = function (keyName) {
    return delete System.Settings[keyName];
};

System.SettingsManager.save = function () {
    System.API.fileSystem.file.write('settings.json', Save.stringify(System.Settings));
};

/*==============================================================
PROCESS MANAGER
===============================================================*/

System.ProcessManager.getFreeId = function () {
    this.idCounter++;
    return this.idCounter;
};

System.ProcessManager.getProcessById = function (processId) {
    for (var i = 0; i < System.Processes.length; i++) {
        if (System.Processes[i].id == processId) return System.Processes[i];
    }
};

System.ProcessManager.getProcessByApplicationName = function (appName) {
    for (var i = 0; i < System.Processes.length; i++) {
        if (System.Processes[i].app !== undefined && System.Processes[i].app.name == appName) return System.Processes[i];
    }
};

System.ProcessManager.getProcessByServiceName = function (serviceName) {
    for (var i = 0; i < System.Processes.length; i++) {
        if (System.Processes[i].service !== undefined && System.Processes[i].service.name == serviceName) return System.Processes[i];
    }
};

System.ProcessManager.killProcess = function (processId) {
    for (var i = 0; i < System.Processes.length; i++) {
        if (System.Processes[i].id == processId) {
            if(System.Processes[i].app !== undefined) {
                var windows = [];
                for (var j = 0; j < System.Processes[i].app.windows.length; j++) {
                    windows.push(System.Processes[i].app.windows[j]);
                }
                for (var j = 0; j < windows.length; j++) {
                    System.WindowManager.removeWindow(windows[j]);
                }
            }
            else {
                System.Processes[i].service.stop();
            }
            System.Processes.splice(i, 1);
            break;
        }
    }
};

/*==============================================================
APPLICATION MANAGER
===============================================================*/

System.ApplicationManager.load = function (app) {
    if (this.getApplicationByName(app.name)) {
        for (var i = 1; ; i++) {
            if (!this.getApplicationByName(app.name + i)) {
                console.error("An app name conflict has occured with " + app.name + ". '" + i + "' was appended to the name");
                app.name += i;
                break;
            }
        }
    }
    System.SettingsManager.loadedSourcesApps++;
    System.Applications.push(app);
    var index = System.Settings.applications.installed.indexOf(app.name);
    if(index == -1) {
        if(app.install !== undefined) app.install();
        System.Settings.applications.installed.push(app.name);
    }
    console.info('[APPLICATIONS] ' + app.name + ' application loaded');
    System.ApplicationManager.initLogin();
};

System.ApplicationManager.getApplicationByName = function (name) {
    for (var i = 0; i < System.Applications.length; i++) {
        if (System.Applications[i].name == name) return System.Applications[i];
    }
    return false;
};

System.ApplicationManager.run = function (app, args, system) {
    if (app && app.main !== undefined) {
		var runningProcess = System.ProcessManager.getProcessByApplicationName(app.name);
		if(runningProcess && !app.allowMultipleInstances) {
			if(runningProcess.app.mainWindow !== undefined) {
				if(runningProcess.app.mainWindow.minimized) runningProcess.app.mainWindow.unminimize();
				else
					runningProcess.app.mainWindow.setFocus();
			}
			else if(runningProcess.app.getOpenedWindowsCount() > 0) {
				if(runningProcess.app.windows[0].minimized) runningProcess.app.windows[0].unminimize();
					else
				runningProcess.app.windows[0].setFocus();
			}
			if(args !== undefined && args.openFile !== undefined) app.open(args.openFile);
		}
		else {
			if (system == undefined) {
				var runBy = localStorage.getItem('username') !== null ? localStorage.getItem('username') : 'Not logged in user';
			}
			else {
				var runBy = 'System';
			}
			var process = new Process(app, runBy);
			System.Processes.push(process);
			app.main(args);
			if(args !== undefined && args.openFile !== undefined) app.open(args.openFile); //FIX
		}
    }
    else {
        System.API.desktopMessageBox(System.Lang.desktop.messages.runAppError, 'error', System.Lang.desktop.dialogs.error);
    }
};

System.ApplicationManager.runByName = function (name, args, system) {
    this.run(this.getApplicationByName(name), args, system);
};

System.ApplicationManager.addAutorunApp = function (appName) {
    for (let i = 0; i < System.Settings.applications.autorun.length; i++) {
        if (System.Settings.applications.autorun[i] == appName) {
            console.error(appName + ' is already added to Autorun');
            return false;
        }
    }
    for (let i = 0; i < System.Applications.length; i++) {
        if (System.Applications[i].name == appName) {
            System.Settings.applications.autorun.push(appName);
            console.info(appName + ' is added to Autorun');
            return true;
        }
    }
    console.error(appName + ' isn\'t loaded');
    return false;
};

System.ApplicationManager.removeAutorunApp = function (appName) {
    for (var i = 0; i < System.Settings.applications.autorun.length; i++) {
        if (System.Settings.applications.autorun[i] == appName) {
            System.Settings.applications.autorun.splice(i, 1);
            console.info(appName + ' is removed from Autorun');
            return true;
        }
    }
    console.error('Couldn\'t find ' + appName);
    return false;
};

System.ApplicationManager.addAutorunService = function (serviceName) {
    for (let i = 0; i < System.Settings.services.autorun.length; i++) {
        if (System.Settings.services.autorun[i] == serviceName) {
            console.error(serviceName + ' is already added to Autorun');
            return false;
        }
    }
    for (let i = 0; i < System.Services.length; i++) {
        if (System.Services[i].name == serviceName) {
            System.Settings.services.autorun.push(serviceName);
            console.info(serviceName + ' is added to Autorun');
            return true;
        }
    }
    console.error(serviceName + ' isn\'t loaded');
    return false;
};

System.ApplicationManager.removeAutorunService = function (serviceName) {
    for (var i = 0; i < System.Settings.services.autorun.length; i++) {
        if (System.Settings.services.autorun[i] == serviceName) {
            System.Settings.services.autorun.splice(i, 1);
            console.info(serviceName + ' is removed from Autorun');
            return true;
        }
    }
    console.error('Couldn\'t find ' + serviceName);
    return false;
};

System.ApplicationManager.runAutorun = function () {
    if (!System.SettingsManager.autorunDone) {
        console.info('[APPLICATIONS] Starting autorun');
        for (let i = 0; i < System.Settings.applications.autorun.length; i++) {
            if (System.ApplicationManager.getApplicationByName(System.Settings.applications.autorun[i])) {
                System.ApplicationManager.runByName(System.Settings.applications.autorun[i]);
            }
        }
        for (let i = 0; i < System.Settings.services.autorun.length; i++) {
            if (System.ServicesManager.getServiceByName(System.Settings.services.autorun[i])) {
                System.ServicesManager.runByName(System.Settings.services.autorun[i]);
            }
        }
        System.ApplicationManager.runByName('Explorer', undefined, true);
        System.desktop.app = System.ApplicationManager.getApplicationByName('Explorer');
        System.SettingsManager.autorunDone = true;
        console.info('[SYSTEM] System initialized');
    }
};

System.ApplicationManager.initLogin = function () {
    if (System.SettingsManager.loadedSourcesApps >= System.SettingsManager.allSourcesApps && !System.init) {
        System.API.user.isLoggedIn(function(r) {
            System.LocalizationManager.setLanguage();
            if(!r) 
                System.ApplicationManager.runByName('Login', {allowClosing: false}, true);
            else
                System.ApplicationManager.runAutorun();
            System.ServicesManager.runByName('Desktop Refresh', undefined, true);
            System.ServicesManager.runByName('Windows Refresh', undefined, true);
            System.init = true;
            System.desktop.onInit();
        });
    }
};

/*==============================================================
SERVICES MANAGER
===============================================================*/

System.ServicesManager.load = function (service) {
    if (this.getServiceByName(service.name)) {
        for (var i = 1; ; i++) {
            if (!this.getServiceByName(service.name + i)) {
                console.error("A service name conflict has occured with " + service.name + ". '" + i + "' was appended to the name");
                service.name += i;
                break;
            }
        }
    }
    System.Services.push(service);
    System.SettingsManager.loadedSourcesApps++;
    System.ApplicationManager.initLogin();
};

System.ServicesManager.getServiceByName = function (name) {
    for (var i = 0; i < System.Services.length; i++) {
        if (System.Services[i].name == name) return System.Services[i];
    }
    return false;
};

System.ServicesManager.run = function (service, args, system) {
    if (service) {
        if(!System.ProcessManager.getProcessByServiceName(service.name)) {
            if (system == undefined) {
                var runBy = localStorage.getItem('username') !== null ? localStorage.getItem('username') : 'Not logged in user';
            }
            else {
                var runBy = 'System';
            }
            var process = new Process(service, runBy);
            System.Processes.push(process);
            service.main(args);
            service.start();
        }
        else {
            console.error(service.name + ' is already running');
        }
    }
    else {
        System.API.desktopMessageBox(System.Lang.desktop.messages.runServiceError, 'error', System.Lang.desktop.dialogs.error);
    }
};

System.ServicesManager.runByName = function (name, args, system) {
    this.run(this.getServiceByName(name), args, system);
};

/*==============================================================
WINDOW MANAGER
===============================================================*/

System.WindowManager.init = function () {
    this.windows = [];
    this.minimizedWindows = [];
    this.windowsIdCounter = 0;
};

System.WindowManager.getWindowById = function(id) {
    for(var i = 0; i < this.windows.length; i++) {
        if(this.windows[i].id == id) return this.windows[i];
    }
};

System.WindowManager.removeWindow = function(window) {
    var index = this.windows.indexOf(window);
    var index2 = window.app.windows.indexOf(window);
    if (index > -1) {
        this.windows.splice(index, 1);
    }
    if (index2 > -1) {
        window.app.windows.splice(index2, 1);
    }
    window.e.fadeOut(System.Settings.desktop.windowFadeOutTime, function() {
        System.desktop.removeTaskbarElement(window);
        window.remove();
        System.WindowManager.setFocusToLastWindow();
    }.bind(this));
}

System.WindowManager.closeWindow = function(window) {
    window.e.fadeOut(System.Settings.desktop.windowFadeOutTime, function() {
        System.desktop.removeTaskbarElement(window);
        System.WindowManager.setFocusToLastWindow();
    });
}

System.WindowManager.setFocusToLastWindow = function() {
    var obj = {};
    for (var key in this.windows) {
        if (this.windows[key].visible) {
            obj[key] = parseInt(this.windows[key].e.css('z-index'));
        }
    }
    var arr = Object.keys(obj).map(function (key) { return obj[key]; });
    var max = Math.max.apply( null, arr );
    var focusSet = false;
    for (var key in this.windows) {
        if (this.windows[key].visible && parseInt(this.windows[key].e.css('z-index')) == max) {
            this.windows[key].setFocus();
            focusSet = true;
            break;
        }
    }
    if(!focusSet) { //FIX
        $('.window').removeClass('focus');
        $('.taskbar-app').removeClass('focus');
    }
};

System.WindowManager.toggle = function () {
    var openedWindows = false;
    for (let i = 0; i < this.windows.length; i++) {
            if(this.windows[i].visible) {
                openedWindows = true;
                this.minimizedWindows = [];
                break;
            }
    }

    if(openedWindows) {
        for (let i = 0; i < this.windows.length; i++) {
            if(this.windows[i].visible /*&& !this.windows[i].minimized*/) {
                this.windows[i].minimize();
                this.minimizedWindows.push(this.windows[i]);
            }
        }
    }
    else {
        for (let i = 0; i < this.minimizedWindows.length; i++) {
            this.minimizedWindows[i].unminimize();
        }
        this.minimizedWindows = [];
    }
};

/*==============================================================
LOCALIZATION MANAGER
===============================================================*/

System.LocalizationManager.init = function () {
    System.Lang = {};
    System.LocalizationManager.locales = [];
};

System.LocalizationManager.load = function (locale) {
    if (this.getLocaleByName(locale.name)) {
        for (var i = 1; ; i++) {
            if (!this.getLocaleByName(locale.name + i)) {
                console.error("A locale name conflict has occured with " + locale.name + ". '" + i + "' was appended to the name");
                locale.name += i;
                break;
            }
        }
    }
    this.locales.push(locale);
    System.SettingsManager.loadedSourcesApps++;
    System.ApplicationManager.initLogin();
};

System.LocalizationManager.getLocaleByName = function (name) {
    for (var i = 0; i < this.locales.length; i++) {
        if (this.locales[i].name == name) return this.locales[i];
    }
    return false;
};

System.LocalizationManager.setLanguage = function () {
    System.Lang = this.getLocaleByName(System.Settings.language) ? this.getLocaleByName(System.Settings.language) : this.getLocaleByName(System.Settings.defaultLanguage);
    console.info('[LOCALIZATION] System language has been set to ' + System.Lang.name);
};

/*==============================================================
IO MANAGER
===============================================================*/

System.IOManager.init = function () {
    $(window).on('mousemove', function (e) {
        System.IOManager.mouse.position = { x: e.clientX, y: e.clientY }; //FIX clientX, clientY
    });
};

/*==============================================================
DESKTOP
===============================================================*/

System.desktop.init = function () {
    this.e = $('#desktop');
    this.window = $(window);
    this.field = new ItemField(0, 0, this.window.width(), this.window.height(), { tiles: '<div class="text">{name}</div>' }, undefined, undefined, { id: 'desktop-items' });
    this.taskbar = new Element('div', undefined, undefined, undefined, { id: 'taskbar' });
    this.taskbarMenus = new Element('span', undefined, undefined, undefined, { id: 'taskbar-menus' });
    this.taskbarApps = new Element('span', undefined, undefined, undefined, { id: 'taskbar-apps' });
    this.time = new Element('span', undefined, undefined, undefined, { id: 'taskbar-time' });
    this.tooltip = new Element('div', undefined, undefined, undefined, { id: 'tooltip' });
    this.contextMenus = {};
    this.contextMenusIdCounter = 0;

    this.addItem(this.field);
    this.addItem(this.taskbar);
    this.addItem(this.tooltip);
    this.taskbar.addItem(this.taskbarMenus);
    this.taskbar.addItem(this.taskbarApps);
    this.taskbar.addItem(this.time);
    this.time.addTooltip(this.getCurrentDate('{day}.{month}.{year}'));
    $('title').html(System.Presets.OSName);
    console.info('[SYSTEM] Desktop initialized');
};

System.desktop.addItem = function (item) {
    this.e.append(item.e);
};

System.desktop.onInit = function() {
    this.createTaskbarMenus();

    this.contextMenus.file = [
    {
        label: System.Lang.desktop.contextmenu.open,
        bold: true,
        action: function() {
            System.API.fileSystem.file.open(this.filePath);
        }
    },
    {
        label: System.Lang.desktop.contextmenu.openWithBrowser,
        action: function() {
            System.API.fileSystem.file.open(this.filePath, 'Browser');
        }
    },
    {
        label: System.Lang.desktop.contextmenu.download, 
        action: function() {
            System.API.fileSystem.file.download(this.filePath);
        }
    },
    {
        label: System.Lang.desktop.contextmenu.rename, 
        action: function() {
            var window = this._window;
            var filePath = this.filePath;
            window.app.prompt(function(r) {
                System.API.fileSystem.file.rename(filePath, r, false, function(r) {
                    if(r) System.desktop.app.refresh(window);
                });
            }, System.Lang.explorer.fileExplorer.renameFile, System.Lang.desktop.contextmenu.rename, System.API.uri.getFileNameWithoutExtension(this.filePath));  
        }
    },
    {
        label: System.Lang.desktop.contextmenu.duplicate, 
        action: function() {
            var window = this._window;
            System.API.fileSystem.file.copy(this.filePath, System.API.uri.getPathWithoutFileName(this.filePath), false, function(r) {
                if(r) System.desktop.app.refresh(window);
            });
        }
    },
    {
        label: System.Lang.desktop.contextmenu.delete, 
        action: function() {
            var window = this._window;
            var items = this.itemField.getSelected();
            for(var i = 0; i < items.length; i++) {
                System.API.fileSystem.file.delete(items[i].path, function(r) {
                    if(r) System.desktop.app.refresh(window);
                });
            }
        }
    }
    ];

    this.contextMenus.imageFile = [
    {
        label: System.Lang.desktop.contextmenu.setAsWallpaper,
        action: function() {
            System.Settings.desktop.backgroundPath = this.filePath;
        }
    }
    ];

    this.contextMenus.jsFile = [
    {
        label: System.Lang.desktop.contextmenu.run,
        action: function() {
            System.API.fileSystem.file.run(this.filePath);
        }
    }
    ];

    this.contextMenus.directory = [
    {
        label: System.Lang.desktop.contextmenu.openNewWindow,
        action: function() {
            System.desktop.app.openPath(this.filePath, true);
        }
    },
    {
        label: System.Lang.desktop.contextmenu.duplicate, 
        action: function() {
            var window = this._window;
            System.API.fileSystem.directory.copy(this.filePath, System.API.uri.getPathWithoutFileName(this.filePath), false, function(r) {
                if(r) System.desktop.app.refresh(window);
            });
        }
    },
    {
        label: System.Lang.desktop.contextmenu.delete, 
        action: function() {
            var window = this._window;
            var items = this.itemField.getSelected();
            for(var i = 0; i < items.length; i++) {
                System.API.fileSystem.directory.delete(items[i].path, function(r) {
                    if(r) System.desktop.app.refresh(window);
                });
            }
        }
    }
    ];

};

System.desktop.addContextMenu = function(item, thisArg) {
    if(System.API.uri.isFile(thisArg.filePath)) {
        var imageFileExtensions = ['jpg', 'gif', 'png'];
        var extension = System.API.uri.getExtension(thisArg.filePath);
        if(imageFileExtensions.indexOf(extension) != -1) 
            var contextmenu = System.desktop.contextMenus.file.concat(System.desktop.contextMenus.imageFile);
        else if(extension == 'js')
            var contextmenu =System.desktop.contextMenus.file.concat(System.desktop.contextMenus.jsFile);
        else
            var contextmenu = System.desktop.contextMenus.file;
        item.addContextMenu(contextmenu, thisArg);
    }
    else {
        item.addContextMenu(System.desktop.contextMenus.directory, thisArg);
    }
};

System.desktop.createTaskbarMenus = function() {
    //APPICATIONS
    this.taskbarMenus.applications = new Element('span', undefined, undefined, System.Lang.desktop.taskbar.applications, { class: 'taskbar-menu' });
    var applicationsMenuArr = [];
    for(let i = 0; i < System.Applications.length; i++) {
        applicationsMenuArr.push({
            label: System.Applications[i].displayName,
            action: function() {
                System.ApplicationManager.run(System.Applications[i]);
            }
        });
    }
    var applicationsMenu = MenuStrip.prototype.createContextMenu(applicationsMenuArr);
    applicationsMenu.addClass('taskbar-context-menu');
    System.desktop.e.append(applicationsMenu);
    this.taskbarMenus.applications.addEvent('click', function(e) {
        //if(e.target !== e.currentTarget) return;
        applicationsMenu.show();
        applicationsMenu.children('ul').css('left', System.desktop.taskbarMenus.applications.e.position().left);
        if(System.Settings.desktop.taskbarPosition == 'top') {
            applicationsMenu.children('ul').css({
                top: System.desktop.taskbar.getHeight(),
                bottom: 'auto'
            });
        }
        else if(System.Settings.desktop.taskbarPosition == 'bottom') {
            applicationsMenu.children('ul').css({
                top: 'auto',
                bottom: System.desktop.taskbar.getHeight()
            });
        }
    });

    //PLACES
    this.taskbarMenus.places = new Element('span', undefined, undefined, System.Lang.desktop.taskbar.places, { class: 'taskbar-menu' });
    var placesMenu = MenuStrip.prototype.createContextMenu([
        {
            label: System.Lang.desktop.contextmenu.homeDirectory,
            action: function() {
                System.desktop.app.openPath('');
            }
        }
        ]);
    placesMenu.addClass('taskbar-context-menu');
    System.desktop.e.append(placesMenu);
    this.taskbarMenus.places.addEvent('click', function(e) {
        //if(e.target !== e.currentTarget) return;
        placesMenu.show();
        placesMenu.children('ul').css('left', System.desktop.taskbarMenus.places.e.position().left);
        if(System.Settings.desktop.taskbarPosition == 'top') {
            placesMenu.children('ul').css({
                top: System.desktop.taskbar.getHeight(),
                bottom: 'auto'
            });
        }
        else if(System.Settings.desktop.taskbarPosition == 'bottom') {
            placesMenu.children('ul').css({
                top: 'auto',
                bottom: System.desktop.taskbar.getHeight()
            });
        }
    });

    //SYSTEM
    this.taskbarMenus.system = new Element('span', undefined, undefined, System.Lang.desktop.taskbar.system, { class: 'taskbar-menu' });
    var systemMenu = MenuStrip.prototype.createContextMenu([
        {
            label: System.Lang.desktop.contextmenu.logout,
            action: function() {
                System.desktop.app.user.logout();
            }
        }
        ]);
    systemMenu.addClass('taskbar-context-menu');
    System.desktop.e.append(systemMenu);
    this.taskbarMenus.system.addEvent('click', function(e) {
        //if(e.target !== e.currentTarget) return;
        systemMenu.show();
        systemMenu.children('ul').css('left', System.desktop.taskbarMenus.system.e.position().left);
        if(System.Settings.desktop.taskbarPosition == 'top') {
            systemMenu.children('ul').css({
                top: System.desktop.taskbar.getHeight(),
                bottom: 'auto'
            });
        }
        else if(System.Settings.desktop.taskbarPosition == 'bottom') {
            systemMenu.children('ul').css({
                top: 'auto',
                bottom: System.desktop.taskbar.getHeight()
            });
        }
    });

    this.taskbarMenus.addItem(this.taskbarMenus.applications);
    this.taskbarMenus.addItem(this.taskbarMenus.places);
    this.taskbarMenus.addItem(this.taskbarMenus.system);
}

System.desktop.getTaskbarApp = function (_window) {
    return this.taskbarApps.e.children('.taskbar-app[data-window-id=' + _window.getId() + ']');
};

System.desktop.addTaskbarApp = function (_window) {
    var item = new Element('span', 0, 0);
    item.addTooltip(_window.getCaption());
    item.e.html(_window.getCaption());
    item.e.addClass('taskbar-app');
    item.e.attr('data-window-id', _window.getId());
    item.e.on('click', function () {
        if (_window.minimized) {
            _window.unminimize();
        }
        else if (!_window.hasFocus()) {
            _window.setFocus();
        }
        else {
            _window.minimize();
        }
    });
    item.addContextMenu([{label: System.Lang.desktop.contextmenu.closeWindow, disabled: !_window.allowClosing, action: function() {
        _window.close();
    }}]); //TEST FIX
    this.taskbarApps.addItem(item);
};

System.desktop.removeTaskbarElement = function (_window) {
    this.taskbarApps.e.children('.taskbar-app[data-window-id=' + _window.getId() + ']').remove();
};

System.desktop.getCurrentTime = function (format) {
    var now = new Date();
    var hours = (now.getHours() < 10 ? '0' : '') + now.getHours();
    var minutes = (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    var seconds = (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();
    return format.formatObject({ hours: hours, minutes: minutes, seconds: seconds });
};

System.desktop.getCurrentDate = function (format) {
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;

    return format.formatObject({ day: day, month: month, year: year });
};

Application.prototype.SettingsManager = System.SettingsManager;
Application.prototype.ProcessManager = System.ProcessManager;
Application.prototype.ApplicationManager = System.ApplicationManager;
Application.prototype.ServicesManager = System.ServicesManager;
Application.prototype.WindowManager = System.WindowManager;
Application.prototype.io = System.IOManager;
Application.prototype.fileSystem = { file: {}, directory: {} };
Application.prototype.uri = {};
Application.prototype.user = {};

/*==============================================================
APPLICATION API
===============================================================*/

function Generic() { }

Generic.prototype.addItem = function (item) {
    if (this.e.hasClass('window')) {
        this.content.append(item.e);
        if(item.resizeToWindow) {
            this.itemsResizedToWindow.push(item);
            item.originalSize = item.getDimensions();
            let window = this;
            this.e.on('resize', function(e, ui) {
                var width = ui.size.width - window.originalSize.width;
                var height = ui.size.height - window.originalSize.height;
                item.setDimensions(item.originalSize.width + width, item.originalSize.height + height);
            });
        }
        else if(item.anchored) {
            this.itemsAnchored.push(item);
            item.originalPosition = item.getPosition();
            let window = this;
            this.e.on('resize', function(e, ui) {
                var width = ui.size.width - window.originalSize.width;
                var height = ui.size.height - window.originalSize.height;
                item.setPosition(item.originalPosition.x + width, item.originalPosition.y);
            });
        }
    }
    else
        this.e.append(item.e);
};

Generic.prototype.setWidth = function (width) {
    if (width > $(window).width())
        this.e.outerWidth($(window).width());
    else
        this.e.outerWidth(width);
};

Generic.prototype.getWidth = function () {
    return this.e.outerWidth();
};

Generic.prototype.setHeight = function (height) {
    if (height > $(window).height())
        this.e.outerHeight($(window).height());
    else
        this.e[0].style.height = height + 'px';
};

Generic.prototype.getHeight = function () {
    return this.e.outerHeight();
};

Generic.prototype.setDimensions = function (width, height) {
    this.setWidth(width);
    this.setHeight(height);
};

Generic.prototype.getDimensions = function () {
    return { width: this.getWidth(), height: this.getHeight() };
};

Generic.prototype.setPosition = function (x, y) {
    this.setPositionX(x);
    this.setPositionY(y);
};

Generic.prototype.setPositionX = function (x) {
    this.e.css('left', x);
};

Generic.prototype.setPositionY = function (y) {
    this.e.css('top', y);
};

Generic.prototype.getPosition = function () {
    return { x: this.getPositionX(), y: this.getPositionY() };
};

Generic.prototype.getPositionX = function () {
    return parseInt(this.e.css('left'));
};

Generic.prototype.getPositionY = function () {
    return parseInt(this.e.css('top'));
};

Generic.prototype.setAttribute = function (attribute, val) {
    this.e.attr(attribute, val);
};

Generic.prototype.setAttributes = function (attributes) {
    this.e.attr(attributes);
};

Generic.prototype.getAttribute = function (attribute) {
    return this.e.attr(attribute);
};

Generic.prototype.setTooltip = function (content, delay) {
    this.e[0].setAttribute('data-tooltip', content);
    this.e[0].setAttribute('data-tooltip-delay', delay !== undefined ? delay : System.Settings.desktop.defaultTooltipDelay);
};

Generic.prototype.addTooltip = function (content, delay) {
    var timeout;
    var tooltip = System.desktop.tooltip.e;
    this.e.attr('data-tooltip', content);
    this.e.attr('data-tooltip-delay', delay !== undefined ? delay : System.Settings.desktop.defaultTooltipDelay);
    this.e.off('mouseenter mouseout mousedown');
    this.e.on('mouseover', function () {
        timeout = setTimeout(function () {
            if (this.e.is(':hover') && !isContextMenuVisible()) {
				tooltip.html(this.e.attr('data-tooltip')).fadeIn(System.Settings.desktop.tooltipFadeTime);
                tooltip.css({
                    'top': System.IOManager.mouse.position.y + 15,
                    'left': System.IOManager.mouse.position.x + 15
                });
                if (tooltip.outerWidth() + System.IOManager.mouse.position.x + 15 > $(window).width()) {
                    tooltip.css({
                        'left': $(window).width() - tooltip.outerWidth() - 30
                    });
                }
                if (tooltip.outerHeight() + System.IOManager.mouse.position.y + 15 > $(window).height()) {
                    tooltip.css({
                        'top': $(window).height() - tooltip.outerHeight() - 30,
                    });
                }
            }
        }.bind(this), parseInt(this.e.attr('data-tooltip-delay')));
    }.bind(this));

    this.e.on('mouseout mousedown', function () {
        clearTimeout(timeout);       
        tooltip.fadeOut(System.Settings.desktop.tooltipFadeTime, function() {
			tooltip.offset({ top: 0, left: 0 });
		});
    });
};

Generic.prototype.removeTooltip = function () {
    this.e.off('mouseenter mouseout');
    this.e.removeAttr('data-tooltip');
};

Generic.prototype.addContextMenu = function(menu, thisArg) {
    var element = this.e;
    this.e.on('contextmenu', function(event) {
        event.preventDefault();
        var div = MenuStrip.prototype.createContextMenu(menu, thisArg !== undefined ? thisArg : undefined);
        var x = System.IOManager.mouse.position.x;
        var y = System.IOManager.mouse.position.y;

        if(div.hasClass('checkable')) {
            if(element.attr('data-contextmenu') == undefined) {
            div.attr('data-contextmenu', System.desktop.contextMenusIdCounter);
            element.attr('data-contextmenu', System.desktop.contextMenusIdCounter);
            System.desktop.contextMenusIdCounter++;
            System.desktop.e.append(div);
            }
            else {
                System.desktop.e.find('.contextmenu[data-contextmenu=' + element.attr('data-contextmenu') + ']').show();
            }
        }
        else {
            System.desktop.e.append(div);
        }
        
        System.desktop.e.find('.contextmenu').each(function() {
            if($(this).css('display') == 'block') {
                var contextmenu = $(this).children('ul');
                contextmenu.css({top: y + 3, left: x + 3});
                if (contextmenu.outerHeight() + y + 3 > $(window).height()) {
                    contextmenu.css({
                        'top': y - contextmenu.outerHeight() - 3,
                    });
                    contextmenu.parent().removeClass('downwards');
                    contextmenu.parent().addClass('upwards');
                }
            }
        });
    });
};

Generic.prototype.remove = function () {
    this.e.remove();
};

Generic.prototype.fillWindow = function() {
    this.e.css('width', '100%');
    this.e.css('height', '100%');
}

Generic.prototype.getValue = function () {
    return this.e.val();
};

Generic.prototype.setValue = function (val) {
    this.e.val(val);
};

Generic.prototype.addEvent = function (event, handler) {
    this.e.on(event, handler);
};

ListOption = function (text, value) {
    this.text = text;
    this.value = value;
};

Tab = function (name, items) {
    this.name = name;
    this.items = items !== undefined ? items : [];
};

function Color(red, green, blue, alpha) { //Can't use anonymous constructor due to serialization limitations
    this.red = red != undefined ? red : 0;
    this.green = green != undefined ? green : 0;
    this.blue = blue != undefined ? blue : 0;
    this.alpha = alpha != undefined ? alpha : 1;
}

Element = function (tag, x, y, html, attributes) {
    var e = $(document.createElement(tag));

    if (attributes !== undefined) e.attr(attributes);
    if (html !== undefined) e.html(html);
    this.e = e;
    this.setPosition(x, y);
};

Window = function (caption, width, height, attributes) {
    var e = $(document.createElement('div'));

    var data = this;

    e
    .addClass('window')
    .html('<div class="window-caption"><h1 class="window-name"></h1><div class="window-action window-action-close"></div><div class="window-action window-action-maximize"></div><div class="window-action window-action-minimize"></div></div>'
        + '<div class="window-content"></div>')
    .hide()
    .resizable(
    {
        handles: "n, e, s, w, ne, se, sw, nw",
        containment: System.desktop.field.e,
        resize: function () {
            if (data.maximized) data.maximized = false; 
        },
        minHeight: 100,
        minWidth: 100,
        maxHeight: System.desktop.window.height(),
        maxWidth: System.desktop.window.width()
    })
    .on('mousedown', function () {
        data.setFocus();
    })
    .find('.window-caption').on('dblclick', function () {
            data.maximize(); //FIX
    })
    .find('.window-action-close').on('click', function () {
        data.close();
    })
    .siblings('.window-action-maximize').on('click', function () {
        data.maximize();
    })
    .siblings('.window-action-minimize').on('click', function () {
        data.minimize();
    });

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.content = e.find('.window-content');
    this.allowMinimizing = true;
    this.allowMaximizing = true;
    this.allowClosing = true;
    this.allowResizing = true;
    Object.defineProperty(this, 'allowResizing', {
        get: function() {
            return !e.resizable('option', 'disabled');
        },
        set: function(value) {
            if(value) 
                e.resizable('enable');
            else
                e.resizable('disable');
        }
    });
    this.setDimensions(width !== undefined ? width : System.Settings.desktop.defaultWindowDimensions.width, height !== undefined ? height : System.Settings.desktop.defaultWindowDimensions.height);
    this.setCaption(caption);
    this.destroyOnClose = false;
    this.showOnTaskbar = true;
    this.minimizeWhenMainWindowMinimized = false;
    this.itemsResizedToWindow = [];
    this.itemsAnchored = [];
    this.maximized = false;
    this.minimized = false;
    this.opened = false;
    this.visible = false;
    this.dimensionsBeforeMaximization = { width: 0, height: 0, x: 0, y: 0 };
    this.designer = function () { };
    this.main = function () { };
};

Tabs = function (x, y, width, height, tabs, attributes) {
    var e = $(document.createElement('div'));

    e.addClass('tabs')
     .html('<ul class="tabs-links"></ul><div class="tabs-content"></div>');
    e.children('.tabs-content').css({ width: width, height: height });

    if (attributes !== undefined) e.attr(attributes);

    this.e = e;
    this.setPosition(x, y);
    
    if (tabs !== undefined) {
        this.addTabs(tabs);
    }
	e.tabs({active: 0});
};

ItemField = function (x, y, width, height, structures, view, items, attributes) {
    var e = $(document.createElement('ul'));

    e.addClass('item-field');
    this.structures = structures; //consider setting as html attributes
    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    if (items !== undefined) this.addItems(items);
    this.setAttribute('data-view', view !== undefined ? view : 'tiles');
    this.selecting = false;
    this.position = { x: 0, y: 0 };
    this.e.on('mousedown', function (e) {
        if (!this.selecting && e.target === this.e[0]) {
            this.position.x = e.pageX - this.e.offset().left;
            this.position.y = e.pageY - this.e.offset().top;
            this.e.append('<div id="selection"></div>');
            $('#selection').css({
                left: this.position.x,
                top: this.position.y,
                width: 0,
                height: 0
            });
            this.e.children('.item').removeClass('selected');
            this.selecting = true;
        }
    }.bind(this));

    this.e.on('mouseup', function () {
        this.selecting = false;
        $('#selection').remove();
    }.bind(this));

    this.e.on('mousemove', function (e) {
        function valueInRange(value, min, max) {
            return (value <= max) && (value >= min);
        }
        if (this.selecting) {
            var tmp = 0;
            var x1 = this.position.x;
            var y1 = this.position.y;
            var x2 = e.pageX - this.e.offset().left;
            var y2 = e.pageY - this.e.offset().top;
            if (x1 > x2) { tmp = x2; x2 = x1; x1 = tmp; }
            if (y1 > y2) { tmp = y2; y2 = y1; y1 = tmp; }
            $('#selection').css({
                left: x1, top: y1, width: x2 - x1, height: y2 - y1
            });
            this.e.children('.item').each(function () {
                var pos = $(this).position();
                var item = $(this);
                var xOverlap = valueInRange(x1, pos.left, pos.left + item.innerWidth()) || valueInRange(pos.left, x1, x1 + (x2 - x1)); //innerWidth or outerWidth
                var yOverlap = valueInRange(y1, pos.top, pos.top + item.innerHeight()) || valueInRange(pos.top, y1, y1 + (y2 - y1));
                if (xOverlap && yOverlap) {
                    $(this).addClass('selected');
                }
                else {
                    $(this).removeClass('selected');
                }
            });
        }
    }.bind(this));

    this.setPosition(x, y);
    this.setDimensions(width, height);
};

Item = function (data, dblclick, click) {
    var e = $(document.createElement('li'));

    e.addClass('item')
            .on('dblclick', dblclick)
            .on('click', function () {
                if(click !== undefined) click();
                e.siblings('.item').removeClass('selected');
                $(this).addClass('selected');
            });
    for (var name in data) {
        e.attr('data-' + name, data[name]);
    }
    this.e = e;
};

MenuStrip = function (menus, attributes) {
    var e = $(document.createElement('ul'));

    e.addClass('menustrip');
    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.addMenus(menus);
};

Button = function (text, x, y, handler, width, icon, attributes) {
    var e = $(document.createElement('button'));

    e.append(icon !== undefined ? '<img src=' + System.API.fileSystem.file.get(icon) + '>' : '<img>')
     .append(text !== undefined ? '<span class="text">' + text + '</span>' : '<span class="text"></span>')
     .on('click', handler);
    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.setPosition(x, y);
    this.setWidth(width);
};

List = function (options, x, y, multiple, attributes) {
    var e = $(document.createElement('select'));
    var str = '';
    for (var option in options) {
        str += '<option value="' + options[option] + '">' + option + '</option>';
    }

    e.html(str);

    if (multiple !== undefined) e.attr('multiple', '');

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.setPosition(x, y);
};

Input = function (type, x, y, name, value, attributes) {
    var e = $(document.createElement('input'));
    
    e.attr('name', name)
     .attr('type', type)
     .val(value);

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.setPosition(x, y);
};

Textarea = function (x, y, width, height, value, attributes) {
    var e = $(document.createElement('div'));

    e.addClass('textarea')
    .append('<textarea>');

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    if (value !== undefined) this.setValue(value);
    this.setPosition(x, y);
    this.setDimensions(width, height);
};

Label = function (text, x, y, attributes) {
    var e = $(document.createElement('label'));

    e.html(text);

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.setPosition(x, y);
};

Element.prototype = new Generic();
Element.prototype.constructor = Element;

Window.prototype = new Generic();
Window.prototype.constructor = Window;

Tabs.prototype = new Generic();
Tabs.prototype.constructor = Tabs;

ItemField.prototype = new Generic();
ItemField.prototype.constructor = ItemField;

Item.prototype = new Generic();
Item.prototype.constructor = Item;

MenuStrip.prototype = new Generic();
MenuStrip.prototype.constructor = MenuStrip;

Button.prototype = new Generic();
Button.prototype.constructor = Button;

List.prototype = new Generic();
List.prototype.constructor = List;

Input.prototype = new Generic();
Input.prototype.constructor = Input;

Textarea.prototype = new Generic();
Textarea.prototype.constructor = Textarea;

Label.prototype = new Generic();
Label.prototype.constructor = Label;

//TABS

Tabs.prototype.addTab = function (tab) {
    name = tab.name.replaceAll(' ', '-');
    this.e.children('ul').append('<li><a href="#' + name + '">' + tab.name + '</a></li>');
    this.e.children('.tabs-content').append('<div id=' + name + '></div>');
    for (var i = 0; i < tab.items.length; i++) {
        this.e.find('.tabs-content #' + name).append(tab.items[i].e);
    }
};

Tabs.prototype.addTabs = function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
        this.addTab(tabs[i]);
    }
};

Tab.prototype.addItem = function (item) {
    this.items.push(item);
};

//COLOR

Color.prototype.toRGBAString = function () {
    return 'rgba(' + this.red + ', ' + this.green + ', ' + this.blue + ', ' + this.alpha + ')';
};

Color.prototype.toRGBString = function () {
    return 'rgb(' + this.red + ', ' + this.green + ', ' + this.blue + ')';
};

Color.prototype.toHexString = function () {
    return "#" + ((1 << 24) + (this.red << 16) + (this.green << 8) + this.blue).toString(16).slice(1);
};

//ITEMFIELD

ItemField.prototype.setView = function (view) {
    this.setAttribute('data-view', view);
};

ItemField.prototype.getView = function () {
    return this.getAttribute('data-view');
};

ItemField.prototype.addItem = function (item) {
    item.e.html(this.structures[this.getView()].formatObject(item.getData()));
    this.e.append(item.e);
};

ItemField.prototype.addItems = function (items) {
    for (var i = 0; i < items.length; i++) {
        this.addItem(items[i]);
    }
};

ItemField.prototype.setItems = function (items) {
    this.clear();
    for (var i = 0; i < items.length; i++) {
        this.addItem(items[i]);
    }
};

ItemField.prototype.setItem = function (item) {
    this.clear();
    this.addItem(item);
};

ItemField.prototype.removeByProperty = function (prop, val) { //FIX PROPERTY OR ATTRIBUTE
    this.e.children('.item').each(function () {
        if ($(this).attr('data-' + prop) == val) $(this).remove();
    });
};

ItemField.prototype.clear = function () {
    this.e.children('.item').remove();
};

ItemField.prototype.getSelected = function () { //FIX Item.prototype.getData()
    var items = [];
    this.e.children('.item.selected').each(function () {
        var obj = {};
        $.each(this.attributes, function () {
            if (this.name.indexOf('data-') == 0) {
                var key = this.name.replace('data-', '');
                obj[key] = this.value;
            }
        });
        items.push(obj);
    });
    return items;
};

Item.prototype.getData = function () {
    var obj = {};
    this.e.each(function () {
        $.each(this.attributes, function () {
            if (this.name.indexOf('data-') == 0) {
                var key = this.name.replace('data-', '');
                obj[key] = this.value;
            }
        });
    });
    return obj;
};

//INPUT

Input.prototype.checked = function () {
    return this.e.prop('checked');
};

Input.prototype.setFocus = function() {
    this.e.focus();
};

//TEXTAREA

Textarea.prototype.setFocus = function() {
    this.e.focus();
};

Textarea.prototype.setValue = function(val) {
    this.e.children('textarea').val(val);
};

Textarea.prototype.getValue = function(val) {
    return this.e.children('textarea').val();
};

//MENUSTRIP

MenuStrip.prototype.createContextMenu = function(nav, thisArg) {
    var checkable = false;
    function createList(nav, list) {
        for(let i = 0; i < nav.length; i++) {
            let li = $(document.createElement('li')).html(nav[i].label);
            if(nav[i].disabled === true) {
                li.addClass('disabled');
            }
            else if(nav[i].submenu !== undefined) {
                li.addClass('expand');
                var ul = $(document.createElement('ul'));
                li.append(ul);
                createList(nav[i].submenu, ul);
            }
            else {
                let item = nav[i];
                var data = thisArg;
                if(nav[i].checked === true) {
                    li.addClass('checked');
                    checkable = true;
                }
                if(nav[i].bold === true) {
                    li.addClass('bold');
                }
                if(nav[i].action !== undefined) {
                    
                    li.on('click', function() {
                        if(data !== undefined) 
                            item.action.call(data);
                        else
                            item.action();
                        li.parents('.contextmenu').hide();
                    });
                }
                if(nav[i].onCheck !== undefined && nav[i].onUnCheck !== undefined) {
                    checkable = true;
                    li.on('click', function() {
                        if(li.hasClass('checked')) {
                            if(data !== undefined) 
                                item.onUnCheck.call(data);
                            else
                                item.onUnCheck();
                            li.removeClass('checked');
                        }
                        else {
                            if(data !== undefined) 
                                item.onCheck.call(data);
                            else
                                item.onCheck();
                            li.addClass('checked');
                        }
                        li.parents('.contextmenu').hide();
                    });
                }
            } 
            list.append(li);
        }
    }
    var div = $(document.createElement('div'));
    div.addClass('contextmenu downwards');
    var e = $(document.createElement('ul'));
    div.append(e);
    createList(nav, e);
    if(checkable) div.addClass('checkable');
    $(document).off('mousedown');
    $(document).on('mousedown', function(e) {
        if($(e.target).parents('.contextmenu').length == 0) {
            System.desktop.e.find('.contextmenu').each(function() {
                if($(this).css('display') == 'block') {
                    if($(this).hasClass('checkable') || $(this).parent().hasClass('menu') || $(this).hasClass('taskbar-context-menu'))
                        $(this).hide().removeClass('upwards').addClass('downwards');
                    else
                        $(this).remove();
                }
            });
        }
    });
    return div;
};

MenuStrip.prototype.addMenus = function(menus) {
    let data = this;
    for(var menu in menus) {
        let _menu = $(document.createElement('li'));
        _menu.addClass('menu');
        _menu.text(menu);
        _menu.append(this.createContextMenu(menus[menu]));
        _menu.children('.contextmenu').css('display', 'none'); //fix
        _menu.on('click', function(e) {
            if(e.target !== e.currentTarget) return;
            var menu = $(this).children('.contextmenu');
            menu.show();
            menu.children('ul').css({
                top: $(this).outerHeight(),
                left: $(this).position().left
            });
        });
        _menu.on('mouseover', function() {
            let li = $(this);
            data.e.find('.contextmenu').each(function() {
                if($(this).css('display') == 'block') {
                    $(this).hide();
                    li.children('.contextmenu').show();
                    li.find('.contextmenu ul').css({
                        top: _menu.outerHeight(),
                        left: _menu.position().left
                    });
                }
            });
        });
        this.e.append(_menu);
    }
};

//BUTTON

Button.prototype.setText = function (text) {
    this.e.find('.text').html(text);
};

Button.prototype.getText = function () {
    return this.e.find('.text').html();
};

Button.prototype.setIcon = function (icon) {
    this.e.find('img').attr('src', icon);
};

Button.prototype.getIcon = function () {
    return this.e.find('img').attr('src');
};

Button.prototype.setFocus = function() {
    this.e.focus();
};

//LIST

List.prototype.getSelected = function () {
    var test = this.e.find('option:selected');
    if (this.e.attr('multiple')) {
        var arr = [];
        test.each(function () {
            arr.push(new ListOption($(this).text(), $(this).val()));
        });
        return arr;
    }
    else {
        return new ListOption(test.text(), test.val());
    }
};

List.prototype.setFocus = function() {
    this.e.focus();
};

//WINDOW

Window.prototype.getId = function () {
    return parseInt(this.e.attr('data-window-id'));
};

Window.prototype.getInnerHeight = function () {
    return parseInt(this.content.outerHeight());
};

Window.prototype.getInnerWidth = function () {
    return parseInt(this.content.outerWidth());
};

Window.prototype.getCaptionHeight = function () {
    return this.e.find('.window-caption').outerHeight();
};


Window.prototype.getCaption = function () {
    return this.e.find('.window-name').html();
};

Window.prototype.setCaption = function (caption) {
    this.e.find('.window-name').html(caption);
    System.desktop.getTaskbarApp(this).html(caption);
    System.desktop.getTaskbarApp(this).attr('data-tooltip', caption); //FIXME
};

Window.prototype.getMinWidth = function() {
    return this.e.resizable('option', 'minWidth');
};

Window.prototype.setMinWidth = function(width) {
    this.e.resizable('option', 'minWidth', width);
};

Window.prototype.getMinHeight = function() {
    return this.e.resizable('option', 'minHeight');
};

Window.prototype.setMinHeight = function(height) {
    this.e.resizable('option', 'minHeight', height);
};

Window.prototype.centerToScreen = function() {
    if(System.Settings.desktop.taskbarPosition == 'top')
        var y = (System.desktop.window.height() - this.getHeight() + System.desktop.taskbar.getHeight()) / 2;
    else if(System.Settings.desktop.taskbarPosition == 'bottom')
        var y = (System.desktop.window.height() - this.getHeight() - System.desktop.taskbar.getHeight()) / 2;
    if(this.getHeight() > System.desktop.window.height() - System.desktop.taskbar.getHeight()) 
        var y = System.desktop.field.getPositionY();
    this.setPosition((System.desktop.window.width() - this.getWidth()) / 2, y);
};

Window.prototype.minimize = function () {
    if (this.allowMinimizing) {
        this.e.fadeOut(System.Settings.desktop.windowFadeOutTime, function() {
            System.WindowManager.setFocusToLastWindow();
        });
        this.minimized = true;
        this.visible = false;
        if(this.isMainWindow()) {
            var windows = this.app.getVisibleChildWindows();
            this.app.minimizedWindows = [];
            for(let i = 0; i < windows.length; i++) {
               if(windows[i].minimizeWhenMainWindowMinimized) this.app.minimizedWindows.push(windows[i]);
            }
            for(let i = 0; i < this.app.minimizedWindows.length; i++) {
               this.app.minimizedWindows[i].minimize();
            }
        }
    }
};

Window.prototype.unminimize = function () {
    this.e.fadeIn(System.Settings.desktop.windowFadeInTime);
	this.setFocus();
    this.minimized = false;
    this.visible = true;
    if(this.isMainWindow()) {
        var windows = this.app.minimizedWindows;
        for(var i = 0; i < windows.length; i++) {
            windows[i].unminimize();
        }
        this.app.minimizedWindows = [];
    }
};

Window.prototype.open = function () {
    if (!this.opened) {
        if(System.desktop.e.find('.window[data-window-id=' +  this.id + ']').length > 0) {
            this.e.fadeIn(System.Settings.desktop.windowFadeInTime);
            System.desktop.addTaskbarApp(this);
        }
        else {
            System.desktop.e.append(this.e);
            this.e.fadeIn(System.Settings.desktop.windowFadeInTime);

            this.e.draggable(
            {
                handle: '.window-caption',
                addClasses: false,
                drag: function () {
                    if (this.maximized) this.unmaximize();
                }.bind(this)
            });

            if (this.showOnTaskbar)
                System.desktop.addTaskbarApp(this);
            else
                this.allowMinimizing = false;
            this.designer();
    		this.centerToScreen();
            this.originalSize = this.getDimensions();
        }
        this.main();
        this.setFocus();
    }
    else if (this.minimized) {
        this.unminimize();
    }
    else {
        this.setFocus();
    }
    this.opened = true;
    this.visible = true;
};

Window.prototype.close = function () {
    if (this.allowClosing && (this.isMainWindow() || this.app.getOpenedWindowsCount() == 0)) {
        this.app.close();
    }
    else if (this.allowClosing) {
        this.opened = false;
        this.visible = false;
        if (this.destroyOnClose) {
            System.WindowManager.removeWindow(this);
        }
        else {
            System.WindowManager.closeWindow(this);
        }
    }
};

Window.prototype.maximize = function () {
    if (this.allowMaximizing) {
        if (this.maximized) this.unmaximize();
        else {
			this.dimensionsBeforeMaximization.width = this.getWidth();
			this.dimensionsBeforeMaximization.height = this.getHeight();
			this.dimensionsBeforeMaximization.x = this.getPosition().x;
			this.dimensionsBeforeMaximization.y = this.getPosition().y;
			this.setDimensions(System.desktop.window.width(), System.desktop.field.getHeight());
			this.setPosition(0, System.desktop.field.getPositionY());

            var width = System.desktop.window.width() - this.dimensionsBeforeMaximization.width;
            var height = System.desktop.field.getHeight() - this.dimensionsBeforeMaximization.height;
            for(let i = 0; i < this.itemsResizedToWindow.length; i++) {
                this.itemsResizedToWindow[i].setWidth(this.itemsResizedToWindow[i].getWidth() + width);
                this.itemsResizedToWindow[i].setHeight(this.itemsResizedToWindow[i].getHeight() + height);
            }
            for(let i = 0; i < this.itemsAnchored.length; i++) {
                this.itemsAnchored[i].setPosition(this.itemsAnchored[i].getPositionX() + width, this.itemsAnchored[i].getPositionY());
            }
			this.maximized = true;
		}
    }
};

Window.prototype.unmaximize = function() {
	this.setDimensions(this.dimensionsBeforeMaximization.width, this.dimensionsBeforeMaximization.height);
	this.setPosition(this.dimensionsBeforeMaximization.x, this.dimensionsBeforeMaximization.y);

    var width = System.desktop.window.width() - this.dimensionsBeforeMaximization.width;
    var height = System.desktop.field.getHeight() - this.dimensionsBeforeMaximization.height;
    for(let i = 0; i < this.itemsResizedToWindow.length; i++) {
        this.itemsResizedToWindow[i].setWidth(this.itemsResizedToWindow[i].getWidth() - width);
        this.itemsResizedToWindow[i].setHeight(this.itemsResizedToWindow[i].getHeight() - height);
    }
    for(let i = 0; i < this.itemsAnchored.length; i++) {
        this.itemsAnchored[i].setPosition(this.itemsAnchored[i].getPositionX() - width, this.itemsAnchored[i].originalPosition.y);
    }
	this.maximized = false;
};

Window.prototype.setMainWindow = function () {
    this.app.mainWindow = this;
};

Window.prototype.isMainWindow = function () {
    return this.app.mainWindow == this;
};

Window.prototype.setFocus = function () {
    if(parseInt(this.e.css('z-index')) < getHighestZIndex() || parseInt(this.e.css('z-index')) == 0) {
        $('.window').removeClass('focus');
        this.e.css('z-index', getHighestZIndex() + 1);
        this.e.addClass('focus');
        if (this.showOnTaskbar) {
            System.desktop.taskbarApps.e.children('.taskbar-app').removeClass('focus');
            System.desktop.getTaskbarApp(this).addClass('focus');
        }
        else {
            System.desktop.taskbarApps.e.children('.taskbar-app').removeClass('focus');
        }
    }
};

Window.prototype.hasFocus = function () {
    return this.e.hasClass('focus');
};

Window.prototype.getChildrenCount = function () {
    return this.e.find('*').length;
};

Window.prototype.remove = function () {
    this.e.fadeOut(System.Settings.desktop.windowFadeOutTime, function () {
        this.e.remove();
    }.bind(this));
};

Window.prototype.getSelectedInputValue = function (name) {
    return this.e.find('input[name=' + name + ']:checked').val();
};

Window.prototype.setInputHandler = function (name, event, handler) {
    this.e.find('input[name=' + name + ']').on(event, handler);
};

//APPLICATION

Application.prototype.messageBox = function (text, icon, caption, buttons) {
    var messageBox = new Window(caption !== undefined ? caption : System.Lang.desktop.dialogs.messagebox, 400, 50);
    messageBox.allowResizing = false;
    this.addWindow(messageBox);
    messageBox.destroyOnClose = true;
    var leftPadding = icon !== undefined ? 52 : 10;
    var buttonHeight = 0;
    var label = new Label(text, leftPadding, 10);
    messageBox.addItem(label);
    messageBox.e.addClass('messagebox');
    messageBox.e.addClass(icon);
    messageBox.open();
    var space = label.getHeight() < 32 ? 50 : 20;
    if (buttons !== undefined) {
        for (var i = 0, width = 0; i < buttons.length; i++) {
            messageBox.addItem(buttons[i]);
            buttons[i].setPosition(leftPadding + width, label.getHeight() + space);
            buttons[i].e.on('click', function() {
                messageBox.close();
            });
            width += buttons[i].getWidth() + 15;
            buttonHeight = buttons[i].getHeight();
        }
    }
    else {
        var button = new Button(System.Lang.desktop.dialogs.okBtn, leftPadding, label.getHeight() + space, function () { messageBox.close(); });
        messageBox.addItem(button);
        buttonHeight = button.getHeight();
        button.setFocus();
    }
	messageBox.setHeight(messageBox.getInnerHeight() + label.getHeight() + buttonHeight + space + 50);
    messageBox.centerToScreen();
};

Application.prototype.desktopMessageBox = function (text, icon, caption, buttons) {
    if (System.desktop.app !== undefined) {
        System.desktop.app.messageBox(text, icon, caption, buttons);
    }
    else {
        switch (icon) {
            case 'error': console.error(text); break;
            case 'info': console.info(text); break;
            case 'warning': console.warn(text); break;
            default: console.log(text);
        }
    }
};

Application.prototype.prompt = function (callback, text, caption, defaultText) {
    var prompt = new Window(caption !== undefined ? caption : System.Lang.desktop.dialogs.prompt, 400, 160);
    prompt.destroyOnClose = true;
    this.addWindow(prompt);
    var label = new Label(text, 15, 15);
    var input = new Input('text', 15, 40, 'prompt-input', defaultText);
    var okBtn = new Button(System.Lang.desktop.dialogs.okBtn, 15, 80, function () { 
        callback(input.getValue());
        prompt.close();
    });
    var cancelBtn = new Button(System.Lang.desktop.dialogs.cancelBtn, 60, 80, function () { prompt.close(); });
    prompt.addItem(label);
    prompt.addItem(input);
    prompt.addItem(okBtn);
    prompt.addItem(cancelBtn);
    prompt.open();
    if(defaultText !== '') input.e.select();
};

Application.prototype.openFileDialog = function (callback, filter, defaultPath, saveFile) {
    var data = this;
    var dialog = new Window(saveFile !== undefined ? System.Lang.desktop.dialogs.saveFile : System.Lang.desktop.dialogs.openFile, 550, 450);
    dialog.destroyOnClose = true;

    var path = defaultPath !== undefined ? defaultPath : (data.getSettingsItem('lastOpenFileDialogPath') !== undefined ? data.getSettingsItem('lastOpenFileDialogPath') : System.Settings.desktop.defaultBrowseDialogPath);
    var currentPath = new Input('text', 15, 15, undefined, path);
    currentPath.setWidth(300);
    dialog.filePath = '';

    var fileTypes = {};
    if(filter !== undefined) 
        fileTypes = filter;
    else
        fileTypes = {[System.Lang.desktop.dialogs.allFiles]: '*'};

    dialog.filterInput = new List(fileTypes, 200, 360);

    var fileName = new Input('text', 15, 360, undefined, '');
    var field = new ItemField(15, 60, 510, 280, { tiles: '<div class="text">{name}</div>' , list: '<div class="text">{name}<span class="size">{size}</span></div>' });
    
    var goBtn = new Button(System.Lang.explorer.fileExplorer.go, 330, 15, function () {
        this.fileSystem.directory.getFilesInfo(currentPath.getValue(), true, populate);
        currentPath.setValue(path);
    }.bind(this));

    var okBtn = new Button(saveFile !== undefined ? System.Lang.desktop.dialogs.saveBtn : System.Lang.desktop.dialogs.openBtn, 340, 360, function () {
        if(saveFile !== undefined) {
            if(fileName.getValue() != '' || dialog.filePath != '') { //dialog.filePath opening, dialog.fileName saving
                var dir = currentPath.getValue() !== '' ? System.API.uri.trimTrailingSlash(currentPath.getValue()) + '/' : '';
                var extension = dialog.filterInput.getSelected().value.split('|')[0];
                data.setSettingsItem('lastOpenFileDialogPath', currentPath.getValue());
                callback(System.API.uri.getExtension(fileName.getValue()) !== '' ? dir +  fileName.getValue() : (dialog.filePath !== '' ? System.API.uri.getPathWithoutExtension(dialog.filePath) + '.' + extension : dir + fileName.getValue() + '.' + extension));
                dialog.close();
            }
        }
        else if(dialog.filePath != '') { //dialog.filePath opening, dialog.fileName saving
            data.setSettingsItem('lastOpenFileDialogPath', currentPath.getValue());
            callback(dialog.filePath);
            dialog.close();
        }
    });

    var cancelBtn = new Button(System.Lang.desktop.dialogs.cancelBtn, 400, 360, function () {
        dialog.close();
    });

    var upBtn = new Button(System.Lang.explorer.fileExplorer.upOneLevel, 376, 15, function () {
        if(currentPath.getValue() != '') {
            var path = this.uri.upOneLevel(currentPath.getValue());
            this.fileSystem.directory.getFilesInfo(path, true, populate);
            currentPath.setValue(path);
        }
    }.bind(this));

    dialog.filterInput.addEvent('change', function() {
        this.fileSystem.directory.getFilesInfo(currentPath.getValue(), true, populate);
    }.bind(this));

    function populate(r) {
        var arr = [];
        if (r) {
            var fileTypes = dialog.filterInput.getSelected().value.split('|');
            for (var key in r) {
                let index = fileTypes.indexOf(System.API.uri.getExtension(key));
                if(System.API.uri.isDirectory(key) || index !== -1 || fileTypes[0] == '*') { //parentheses fix
                    var item = new Item({ name: r[key].name, path: data.uri.getUserDirectory(r[key].relative_path, true) + r[key].name, size: bytesToSize(r[key].size)}, function () {
                        var s = data.uri.getUserDirectory(this.relative_path, true) + this.name;
                        if(data.uri.isFile(s)) {
                            data.setSettingsItem('lastOpenFileDialogPath', currentPath.getValue());
                            callback(s);
                            dialog.close();
                        }
                        else {
                            data.fileSystem.directory.getFilesInfo(s, true, populate);
                            currentPath.setValue(s);                       
                        }
                    }.bind(r[key]), function () {
                        var s = this.name;
                        if(data.uri.isFile(s)) {
                            fileName.setValue(data.uri.getFileNameWithoutExtension(s));
                            dialog.filePath = data.uri.getUserDirectory(this.relative_path, true) + this.name;
                        }
                    }.bind(r[key]));
                    item.e.css('background-image', getIconByFileExtension(data.uri.getExtension(r[key].name)));
                    item.addTooltip('<div>' + System.Lang.explorer.fileExplorer.fileName + ': ' + r[key].name + '</div>' + (data.uri.isFile(r[key].name) ? '<div>' + System.Lang.explorer.fileExplorer.fileSize + ': ' + bytesToSize(r[key].size) : '') + '</div><div>' + System.Lang.explorer.fileExplorer.fileModDate + ': ' + new Date(r[key].date * 1000).toUTCString());
                    arr.push(item);
                }
            }
        }
        field.setItems(arr);
    }
    this.addWindow(dialog);
    dialog.addItem(currentPath);
    dialog.addItem(fileName);
    dialog.addItem(dialog.filterInput);
    dialog.addItem(field);
    dialog.addItem(goBtn);
    dialog.addItem(okBtn);
    dialog.addItem(cancelBtn);
    dialog.addItem(upBtn);
    dialog.open();
    this.fileSystem.directory.getFilesInfo(path, true, populate);
};

Application.prototype.saveFileDialog = function(callback, filter, defaultPath) {
    this.openFileDialog(callback, filter, defaultPath, true);
};

Application.prototype.browseDirectoryDialog = function (callback, defaultPath) {
    var data = this;
    var dialog = new Window(System.Lang.desktop.dialogs.browseDir, 600, 360);
    dialog.destroyOnClose = true;
    var path = defaultPath !== undefined ? defaultPath : (data.getSettingsItem('lastDirectoryBrowserDialogPath') !== undefined ? data.getSettingsItem('lastDirectoryBrowserDialogPath') : System.Settings.desktop.defaultBrowseDialogPath);
    var currentPath = new Input('text', 15, 275, undefined, path);
    var foldersField = new ItemField(15, 15, 550, 250, { tiles: '<div class="text">{name}</div>', list: '<div class="text">{name}, path: {path}</div>' });
    var okBtn = new Button('OK', 305, 275, function () {
        data.setSettingsItem('lastDirectoryBrowserDialogPath', currentPath.getValue());
        callback(currentPath.getValue());
        dialog.close();
    });
    var cancelBtn = new Button(System.Lang.desktop.dialogs.cancelBtn, 350, 275, function () { 
        dialog.close();
    });
    var upBtn = new Button(System.Lang.explorer.fileExplorer.upOneLevel, 210, 275, function () {
        if(currentPath.getValue() != '') {
            var path = this.uri.upOneLevel(currentPath.getValue());
            this.fileSystem.directory.getFilesInfo(path, true, populate);
            currentPath.setValue(path);
        }
    }.bind(this));
    function populate(r) {
        var arr = [];
        if (r) {
            for (key in r) {
                if (!data.uri.isFile(r[key].name)) {
                    var item = new Item({ name: r[key].name, path: data.uri.getUserDirectory(r[key].relative_path, true) + r[key].name }, function () {
                        var s = data.uri.getUserDirectory(this.relative_path, true) + this.name;
                        data.fileSystem.directory.getFilesInfo(s, true, populate);
                        currentPath.setValue(s);
                    }.bind(r[key]));
                    item.e.css('background-image', "url('" + System.Presets.resourcesPath + "folder.png')");
                    item.addTooltip('<div>' + System.Lang.explorer.fileExplorer.fileName + ': ' + r[key].name + '</div><div>' + System.Lang.explorer.fileExplorer.fileModDate + ': ' + new Date(r[key].date * 1000).toUTCString());
                    arr.push(item);
                }
            }
        }
        foldersField.setItems(arr);
    }
    this.addWindow(dialog);
    dialog.addItem(currentPath);
    dialog.addItem(foldersField);
    dialog.addItem(okBtn);
    dialog.addItem(cancelBtn);
    dialog.addItem(upBtn);
    this.fileSystem.directory.getFilesInfo(path, true, populate);
    dialog.open();
};

Application.prototype.addWindow = function (_window) {  
    _window.id = System.WindowManager.windowsIdCounter;
    _window.app = this;
    _window.e.attr('data-window-id', System.WindowManager.windowsIdCounter);
    System.WindowManager.windows.push(_window);
    this.windows.push(_window);
    System.WindowManager.windowsIdCounter++;
};

Application.prototype.getOpenedWindowsCount = function() {
	var number = 0;
	for(var i = 0; i < this.windows.length; i++) {
		if(this.windows[i].opened) number++;
	}
	return number;
};

Application.prototype.getVisibleChildWindows = function() {
    var windows = [];
    for(var i = 0; i < this.windows.length; i++) {
        if(!this.windows[i].isMainWindow() && this.windows[i].visible)  windows.push(this.windows[i]);
    }
    return windows;
};

Application.prototype.close = function () {
    if(this.onClose !== undefined) 
        this.onClose();
    else 
        System.ProcessManager.killProcess(this.processId);
};

//FILESYSTEM FILE

Application.prototype.fileSystem.file.uploadFromDisk = function (path, inputUpload, progressElement, overwrite, callback) {
    var data = new FormData();
    for(var i = 0; i < inputUpload.e[0].files.length; i++) {
        data.append('userfiles[]', inputUpload.e[0].files[i]);
    }
    data.append('upload_path', path !== undefined ? path : '');
    data.append('upload_overwrite', overwrite !== undefined ? overwrite : false);
    $.ajax({
        xhr: function () {
            var xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
                xhr.upload.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        if (progressElement !== undefined) progressElement.e.attr({ value: e.loaded, max: e.total });
                    }
                }, false);
            }
            return xhr;
        },
        url: System.Presets.filesController + 'uploadFromDisk',
        type: 'POST',
        dataType: 'json',
        data: data,
        cache: false,
        beforeSend: function () {
            progressElement.e.attr({ value: 0, max: 1 });
        },
        processData: false,
        contentType: false,
        success: callback
    });
};

Application.prototype.fileSystem.file.uploadFromUrl = function (url, path, overwrite, callback) {
    $.ajax({
        url: System.Presets.filesController + 'uploadFromUrl',
        type: 'POST',
        dataType: 'json',
        data: { upload_url: url, upload_path: path !== undefined ? path : '', upload_overwrite: overwrite !== undefined ? overwrite : false },
        cache: false,
        success: callback
    });
};

Application.prototype.fileSystem.file.download = function (filePath) {
    window.location = System.Presets.filesController + 'download_file/' + System.API.uri.encode(filePath);
};

Application.prototype.fileSystem.file.open = function (filePath, appName) {
    if(appName !== undefined) {
        if(appName == 'Browser') 
            window.open(this.get(filePath));
        else
            System.ApplicationManager.runByName(appName, {openFile: filePath});
    }
    else {
    	var app = System.Settings.associatedFileExtensions[System.API.uri.getExtension(filePath)];
    	if(app !== undefined && app !== 'Browser') 
    		System.ApplicationManager.runByName(app, {openFile: filePath});
    	else 
    		window.open(this.get(filePath));
    }
};

Application.prototype.fileSystem.file.get = function (filePath) {
    if(filePath.startsWith('/') || filePath.startsWith('http'))
        return filePath;
    else
        return System.Presets.filesController + 'open_file/' + System.API.uri.encode(filePath);
};

Application.prototype.fileSystem.file.run = function (filePath) {
    if(System.API.uri.getExtension(filePath) == 'js') {
        System.API.fileSystem.file.read(filePath, function(r) {
            eval(r);
        });
    }
};

//FILESYSTEM FILE IO

Application.prototype.fileSystem.file.write = function (filePath, data, callback) {
    $.ajax({
        type: 'POST',
        data: { write_file_data: data, write_file_path: filePath },
        url: System.Presets.filesController + 'write_file',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.file.read = function (filePath, callback) {
    $.ajax({
        type: 'POST',
        data: { read_file_path: filePath },
        url: System.Presets.filesController + 'read_file',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.file.delete = function (filePath, callback) {
    $.ajax({
        type: 'POST',
        data: { delete_file_path: filePath },
        url: System.Presets.filesController + 'delete_file',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.file.rename = function (path, newName, overwrite, callback) {
    $.ajax({
        type: 'POST',
        data: { rename_file_path: path, rename_new_name: newName, rename_overwrite: overwrite !== undefined ? overwrite : false, copy_of:  System.Lang.fileSystem.copyOf },
        url: System.Presets.filesController + 'rename_file',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.file.move = function (path, destination, callback) {
    $.ajax({
        type: 'POST',
        data: { move_path: path, move_destination: destination },
        url: System.Presets.filesController + 'move',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.file.copy = function (filePath, destination, overwrite, callback) {
    $.ajax({
        type: 'POST',
        data: { copy_file_path: filePath, copy_file_destination: destination, copy_file_overwrite: overwrite !== undefined ? overwrite : false, copy_of:  System.Lang.fileSystem.copyOf},
        url: System.Presets.filesController + 'copy_file',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.file.exists = function (filePath, callback) {
    $.ajax({
        type: 'POST',
        data: { exists_path: filePath },
        url: System.Presets.filesController + 'exists',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.file.remoteExists = function (fileUrl, callback) {
    $.ajax({
        type: 'POST',
        data: { remote_file_exists_url: fileUrl },
        url: System.Presets.filesController + 'remote_file_exists',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.file.getInfo = function (filePath, callback) {
    $.ajax({
        type: 'POST',
        data: { get_file_info_path: filePath },
        url: System.Presets.filesController + 'get_file_info',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

//FILESYSTEM DIRECTORY

Application.prototype.fileSystem.directory.create = function (path, mode, callback) {
    $.ajax({
        type: 'POST',
        data: { create_dir_path: path, create_dir_mode: (mode !== undefined ? mode : 700) },
        url: System.Presets.filesController + 'create_dir',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.directory.delete = function (directoryPath, callback) {
    $.ajax({
        type: 'POST',
        data: { delete_dir_path: directoryPath },
        url: System.Presets.filesController + 'delete_dir',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.directory.rename = Application.prototype.fileSystem.file.rename;

Application.prototype.fileSystem.directory.move = Application.prototype.fileSystem.file.move; 

Application.prototype.fileSystem.directory.copy = function (directoryPath, destination, overwrite, callback) {
    $.ajax({
        type: 'POST',
        data: { copy_dir_path: directoryPath, copy_dir_destination: destination, copy_dir_overwrite: overwrite != undefined ? overwrite : false, copy_of:  System.Lang.fileSystem.copyOf },
        url: System.Presets.filesController + 'copy_dir',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.directory.exists = Application.prototype.fileSystem.file.exists;

Application.prototype.fileSystem.directory.getFilenames = function (path, include_path, callback) {
    $.ajax({
        type: 'POST',
        data: { get_filenames_path: path, get_filenames_include_path: (include_path ? include_path : false) },
        url: System.Presets.filesController + 'get_filenames',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.fileSystem.directory.getFilesInfo = function (path, top_level_only, callback) {
    $.ajax({
        type: 'POST',
        data: { get_dir_file_info_path: path, get_dir_file_info_top_level_only: (top_level_only ? top_level_only : false) },
        url: System.Presets.filesController + 'get_dir_file_info',
        dataType: 'json',
        cache: 'false',
        success: function(r) {
            if(System.Settings.fileSystem.sortDirectoriesBeforeFiles) {
                var directories = {};
                var files = {};
                for(var item in r) {
                    if(System.API.uri.isFile(item)) {
                        files[item] = r[item];
                    }
                    else {
                        directories[item] = r[item];
                    }
                }
                for (var prop in files) { 
                    directories[prop] = files[prop]; 
                }
                callback(directories);
            }
            else callback(r);
        }
    });
};

//URI

Application.prototype.uri.encode = function (path) {
    return encodeURIComponent(path.replaceAll(RegExp.escape('/'), '~'));
};

Application.prototype.uri.decode = function (path) {
    return decodeURIComponent(path).replaceAll(RegExp.escape('~'), '/');
};

Application.prototype.uri.getExtension = function (path) {
    var parts = path.split('.');
    return parts.length > 1 ? parts.pop() : '';
};

Application.prototype.uri.isFile = function (path) { //REWRITE TO PHP
    return path.split('/').pop().split('.').length > 1;
};

Application.prototype.uri.isDirectory = function (path) {
    return !this.isFile(path);
};

Application.prototype.uri.getFileName = function (path) {
    return path.replace(/^.*[\\\/]/, '');
};

Application.prototype.uri.getFileNameWithoutExtension = function (path) {
    var parts = this.getFileName(path).split('.');
    return parts.length > 1 ? parts.slice(0, -1).join('.') : parts.pop();
};

Application.prototype.uri.getPathWithoutExtension = function (path) {
    return path.replace(/\.[^/.]+$/, '');
};

Application.prototype.uri.getDirectoryName = function (path) {
    return path.match(/([^\/]*)\/*$/)[1];
};

Application.prototype.uri.getPathWithoutFileName = function (path) {
    return path.substring(0, path.lastIndexOf('/'));
};

Application.prototype.uri.trimTrailingSlash = function (path) {
    return path.replace(/\/$/, '');
};

Application.prototype.uri.upOneLevel = function (path) {
    return path.split('/').slice(0, -1).join('/');
};

Application.prototype.uri.getUserDirectory = function (path, trailing) {
    var parts = path.split('/');
    if (parts[System.Presets.serverPathDropSegments] !== '') {
        return trailing === true ? parts.slice(System.Presets.serverPathDropSegments).join('/') + '/' : parts.slice(System.Presets.serverPathDropSegments).join('/');
    }
    else {
        return parts.slice(System.Presets.serverPathDropSegments).join('/');
    }
};

//USER MANAGER

Application.prototype.user.login = function (username, password, callback) {
    $.ajax({
        type: 'POST',
        data: { username: username, password: password },
        url: System.Presets.usersController + 'login',
        dataType: 'json',
        cache: 'false',
        success: function (r) {
            if (r) {
                if (r.first_run) {
					System.SettingsManager.init();
                    System.API.fileSystem.directory.create('apps');
                    System.API.fileSystem.directory.create('desktop');
                    System.SettingsManager.save();
                }
                else {
                    System.SettingsManager.load(System.ApplicationManager.runAutorun);
                }
                localStorage.setItem('username', username);
            }
            if (callback !== undefined) callback(r);
        }
    });
};

Application.prototype.user.getUsername = function () {
    return localStorage.getItem('username') !== null ? localStorage.getItem('username') : '';
};

Application.prototype.user.logout = function (reload = true, callback) {
    $.ajax({
        type: 'POST',
        url: System.Presets.usersController + 'logout',
        dataType: 'json',
        cache: 'false',
        success: function (r) {
            if (r) System.SettingsManager.init();
            localStorage.removeItem('username');
            if(reload) {
                location.reload();
            }
            else {
                System.ApplicationManager.runByName('Login', undefined, true);
                if(callback !== undefined) callback();
            }
        }
    });
};

Application.prototype.user.isLoggedIn = function (callback) {
    $.ajax({
        type: 'POST',
        url: System.Presets.usersController + 'is_logged',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

Application.prototype.user.register = function (username, password, password_conf, callback) {
    $.ajax({
        type: 'POST',
        data: { username: username, password: password, password_conf: password_conf },
        url: System.Presets.usersController + 'register',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
};

//SETTINGS

Application.prototype.getSettingsItem = function (item) {
    if(System.Settings.applications.settings[this.name] !== undefined && System.Settings.applications.settings[this.name][item] !== undefined )
        return System.Settings.applications.settings[this.name][item];
    else 
        return undefined;
};

Application.prototype.setSettingsItem = function (name, value) {
    if(System.Settings.applications.settings[this.name] === undefined) System.Settings.applications.settings[this.name] = {};
    System.Settings.applications.settings[this.name][name] = value;
};

Application.prototype.setSettingsItems = function (obj) {
    if(System.Settings.applications.settings[this.name] === undefined) System.Settings.applications.settings[this.name] = {};
    for (var prop in obj) { 
        System.Settings.applications.settings[this.name][prop] = obj[prop]; 
    }
};

Application.prototype.getSettings = function () {
    return System.Settings.applications.settings[this.name];
};

Application.prototype.clearSettings = function () {
    delete System.Settings.applications.settings[this.name];
};

//SERVICE

Service.prototype.start = function () {
    if(!this.running) {
        this.repeat();
        this.running = true;
        //if(System.ProcessManager.getProcessById(this.processId).runBy !== 'System') System.ApplicationManager.addAutorunService(this.name);
    }
};

Service.prototype.stop = function () {
    clearTimeout(this.timeoutId);
    this.running = false;
    //if(System.ProcessManager.getProcessById(this.processId).runBy !== 'System') System.ApplicationManager.removeAutorunService(this.name);
};

//PROCESS

Process.prototype.kill = function () {
    System.ProcessManager.killProcess(this.id);
};

Process.prototype.getChildrenCount = function () {
    var num = 0;
    for (var i = 0; i < this.app.windows.length; i++) {
        num += this.app.windows[i].opened ? this.app.windows[i].getChildrenCount() : 0;
    }
    return num;
};

//EVENTS

onerror = function (error, url, line) {
    if (System.init) System.API.desktopMessageBox(System.Lang.desktop.messages.error.formatObject({ error: error, url: url, line: line }), 'error', System.Lang.desktop.dialogs.error);
};

onbeforeunload = function () {
    if (System.init) System.SettingsManager.save();
};

onload = function () {
    System.Init();
};