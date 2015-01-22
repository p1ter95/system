//EXTENDING STRING PROTOTYPE

String.prototype.format = function () {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
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

String.prototype.replaceAll = function(find, replace) {
    return this.replace(new RegExp(find, 'g'), replace);
}

/*==============================================================
MISC HELPER FUNCTIONS
===============================================================*/

function bool(val) {
    if (insensitiveCmp(val, 'true')) {
        return true;
    }
    else if (insensitiveCmp(val, 'false')) {
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

function insensitiveCmp(str1, str2) {
    return str1.toUpperCase() == str2.toUpperCase();
}

function bytesToSize(bytes) {
    if (bytes === 0) return '0 byte';
    var k = 1000;
    var sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

/*==============================================================
THE SYSTEM
===============================================================*/

System = {};

System.Presets = {};
System.SettingsManager = {};
System.ProcessManager = { id_counter: 0, process_ids: [] };
System.ApplicationManager = {};
System.ServicesManager = {};
System.LocalizationManager = {};
System.UserManager = {};
System.IOManager = { mouse: {} };
System.desktop = {};
System.Applications = [];
System.Processes = [];
System.Services = [];

System.Init = function () {
    this.SettingsManager.init();
    this.LocalizationManager.init();
    this.IOManager.init();
    this.Presets.init();
    this.desktop.init();
    System.SettingsManager.load();
    this.ApplicationManager.refresh();
};

System.SettingsManager.init = function () {
    System.Settings = {};
    System.Settings.defaultDimensions = { width: 640, height: 480 };
    System.Settings.fadeInTime = 200;
    System.Settings.fadeOutTime = 200;
    System.Settings.taskbarHeight = 40;
    System.Settings.taskbarItemWidth = 100;
    System.Settings.desktopRefreshRate = 5;
    System.Settings.desktopBackgroundPath = '';
    System.Settings.defaultServicesFrequency = 5;
    System.Settings.autorun = ['Login'];
    System.Settings.defaultZIndex = 100;
    System.Settings.tooltipDelay = 0.4;
    System.Settings.applicationRefreshRate = 5;
    System.Settings.sources = [{ filePath: System.Presets.systemApplicationsPath + 'explorer.js', external: true },
        { filePath: System.Presets.systemApplicationsPath + 'login.js', external: true },
        { filePath: System.Presets.languagesPath + 'english.js', external: true }];
    System.Settings.applicationSettings = [];
    System.Settings.language = 'English';

    System.SettingsManager.loadedSources = 0;
}

System.Presets.init = function () {
    System.Presets.OSName = 'System';
    System.Presets.OSVersion = 0.01;
    System.Presets.filesController = '/files/';
    System.Presets.usersController = '/members2/'
    System.Presets.systemApplicationsPath = '/system-apps/';
    System.Presets.languagesPath = '/lang/';
}

Process = function (id, app, run_by) {
    this.id = id;
    this.app = app;
    this.run_by = run_by;
}

Application = function (name) {
    this.process_id = 0;
    this.name = name;
    this.displayName = name;
    this.info = {};
    this.info.description = 'Unknown';
    this.info.version = 1;
    this.info.author = 'Unknown';
    this.info.url = 'Unknown';
    this.info.language = 'Unknown';
    this.windows = [];

    this.main = function () { };
}

Service = function (name, frequency) {
    this.name = name;
    this.running = false;
    this.timeoutId = 0;
    this.main = function () { };
    this.loop = function () {
        this.main();
        this.timeoutId = setTimeout(this.loop.bind(this), 1000 / this.frequency);    
    };
    this.frequency = frequency !== undefined ? frequency : System.Settings.defaultServicesFrequency;
}

System.API = Application.prototype;

/*==============================================================
SETTINGS MANAGER
===============================================================*/

System.SettingsManager.addSource = function (filePath, external) {
    var fileName = System.API.getFilenameFromPath(filePath);
    var installed = false;
    for (var i = 0; i < System.Settings.sources.length; i++) {
        if (System.Settings.sources[i].filePath == filePath) {
            installed = true;
            console.error(fileName + ' is already added to sources');
            break;
        }
    }
    if (!installed) {
        System.UserManager.isLogged(function (r) {
            if (success(r)) {
                System.SettingsManager.loadFile(filePath, external, function (r) {
                    if (r) {
                        System.Settings.sources.push({ filePath: filePath, external: external ? external : false });
                        System.SettingsManager.save();
                        console.info(fileName + ' added to sources');
                    }
                });
            }
            else {
                console.error('You\'re not logged in');
            }
        });
    }
}

System.SettingsManager.removeSource = function (filePath) {
    var fileName = System.API.getFilenameFromPath(filePath);
    var unistalled = false;
    for (var i = 0; i < System.Settings.sources.length; i++) {
        if (System.Settings.sources[i].filePath == filePath) {
            var unloaded = false;
            $('head script').each(function () {
                if ($(this).attr('data-source-path') == filePath) {
                    $(this).remove();
                    unloaded = true;
                    console.info(fileName + ' unloaded');
                }
            });
            if (!unloaded) console.error('Couldn\'t find ' + fileName);
            System.Settings.sources.splice(i, 1);
            System.SettingsManager.save();
            console.info(fileName + ' removed from sources');
            unistalled = true;
            break;
        }
    }
    if (!unistalled) console.error('Couldn\'t find ' + fileName);
}

System.SettingsManager.loadFile = function (filePath, external, callback) {
    var fileName = System.API.getFilenameFromPath(filePath);
    var loaded = false;
    $('head script').each(function () {
        if ($(this).attr('data-source-path') == filePath) {
            console.error(fileName + ' is already loaded');
            loaded = true;
            if (callback !== undefined) callback(false);
        }
    });
    if (!loaded) {
        var app = document.createElement('script');
        app.setAttribute('data-source-path', filePath);
        if (System.API.isFile(filePath)) {
            if (!external) {
                System.API.fileExists(filePath, function (r) {
                    if (success(r)) { 
                        app.src = System.Presets.filesController + 'open_file/' + System.API.encodeURI(filePath);
                        document.head.appendChild(app);
                        console.info(fileName + ' loaded');
                        if (callback !== undefined) callback(true);
                    }
                    else {
                        console.error('Couldn\' find ' + fileName);
                        if (callback !== undefined) callback(false);
                    }
                });
            }
            else {
                app.src = filePath;
                document.head.appendChild(app);
                console.info(fileName + ' loaded');
                if (callback !== undefined) callback(true);
            }
        }
        else {
            if (!external) {
                System.API.getFilenames(filePath, false, false, function (r) {
                    if (success(r)) {
                        for (var i = 0; i < r.data.length; i++) {
                            app.src = System.Presets.filesController + 'open_file/' + System.API.encodeURI(r.data[i]);
                            document.head.appendChild(app);
                        }
                        console.info(fileName + ' loaded');
                        if (callback !== undefined) callback(true);
                    }
                    else {
                        console.error('Couldn\'t find that directory');
                        if (callback !== undefined) callback(false);
                    }
                });
            }
            else {
                console.error('You can\'t load external directory');
                if (callback !== undefined) callback(false);
            }
        }
    }
}

System.SettingsManager.loadSources = function () {
    for (var i = 0; i < System.Settings.sources.length; i++) {
        this.loadFile(System.Settings.sources[i].filePath, System.Settings.sources[i].external);
    }
}

System.SettingsManager.load = function () {
    System.API.readFile('settings.cfg', function (r) {
        if (success(r)) {
            var obj = JSON.parse(r.data);
            for (var name in obj) {
                System.Settings[name] = obj[name];
            }
        }
        System.SettingsManager.loadSources();
    });   
}

System.SettingsManager.removeKey = function (keyName) {
    return delete System.Settings[keyName];
}

System.SettingsManager.save = function () {
    System.API.writeFile('settings.cfg', JSON.stringify(System.Settings, null, '\t'));
}

/*==============================================================
PROCESS MANAGER
===============================================================*/

System.ProcessManager.getFreeId = function () {
    this.id_counter++;
    this.process_ids.push(this.id_counter);
    return this.id_counter;
}

System.ProcessManager.getProcessIds = function () {
    return this.process_ids;
}

System.ProcessManager.getProcessById = function (process_id) {
    for (var i = 0; i < System.Processes.length; i++) {
        if (System.Processes[i].id == process_id) return System.Processes[i];
    }
}

System.ProcessManager.killProcess = function (process_id) {
    for (var i = 0; i < System.Processes.length; i++) {
        if (System.Processes[i].id == process_id) {
            for (var j = 0; j < System.Processes[i].app.windows.length; j++) {
                //System.Processes[i].app.windows[j].close(); CZA NAPRAWIC
                System.ApplicationManager.closeWindow(process_id, System.Processes[i].app.windows[j].getId());
            }
            System.Processes.splice(i, 1);
            var index = this.process_ids.indexOf(process_id); //LOL
            this.process_ids.splice(index, 1);
            break;
        }
    }
}

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
    System.SettingsManager.loadedSources++;
    System.Applications.push(app);
    System.ApplicationManager.runAutorunApps();
}

System.ApplicationManager.closeWindow = function (process_id, window_id) {
    $('[data-window-process-id=' + process_id + '][data-window-id=' + window_id + ']').fadeOut(System.Settings.fadeOutTime, function () {
        $(this).remove();
    });
}

System.ApplicationManager.getApplicationByName = function (name) {
    for (var i = 0; i < System.Applications.length; i++) {
        if (System.Applications[i].name == name) return System.Applications[i];
    }
    return false;
}

System.ApplicationManager.run = function (app, args, system) {
    if (app) {
        var id = System.ProcessManager.getFreeId();
        System.UserManager.getUsername(function (r) {
            var run_by = '';
            if (!system) {
                if (success(r)) {
                    run_by = r.username;
                }
                else {
                    run_by = 'Not logged in user';
                }
            }
            else {
                run_by = 'System';
            }
            var process = new Process(id, app, run_by);
            System.Processes.push(process);
            app.process_id = id;
            app.main(args);
        });
    }
    else {
        System.API.desktopMessageBox('Couldn\'t run that app', 'error', 'Error');
    }
}

System.ApplicationManager.runByName = function (name, args, system) {
    this.run(this.getApplicationByName(name), args, system);
}

System.ApplicationManager.refresh = function () {
    for (var i = 0; i < System.Processes.length; i++) {
        var id = System.ProcessManager.getProcessIds()[i];
        var process = System.ProcessManager.getProcessById(id);

        for (var j = 0; j < System.Processes[i].app.windows.length; j++) {
            var _window = System.Processes[i].app.windows[j];

            if (_window.maximized && _window.getPosition().x === 0 && _window.getPosition().y === 0) _window.e.find('.window-action-maximize').css('background-image', 'url("res/maximize2.png")');
            else
                _window.e.find('.window-action-maximize').css('background-image', 'url("res/maximize.png")');
        }
    }
    setTimeout(System.ApplicationManager.refresh, 1000 / System.Settings.applicationRefreshRate);
}

System.ApplicationManager.addAutorunApp = function (appName) {
    var added = false;
    var exists = false;
    for (var i = 0; i < System.Settings.autorun.length; i++) {
        if (System.Settings.autorun[i] == appName) {
            added = true;
            console.error(appName + ' is already added to Autorun');
            break;
        }
    }
    for (var j = 0; j < System.Applications.length; j++) {
        if (System.Applications[j].name == appName) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        console.error(appName + ' isn\'t loaded');
    }
    else if (!added) {
        System.Settings.autorun.push(appName);
        console.info(appName + ' is added to Autorun');
        System.SettingsManager.save();
    }
}

System.ApplicationManager.removeAutorunApp = function (appName) {
    var removed = false;
    for (var i = 0; i < System.Settings.autorun.length; i++) {
        if (System.Settings.autorun[i] == appName) {    
            System.Settings.autorun.splice(i, 1);
            removed = true;
            console.info(appName + ' removed from Autorun');
            System.SettingsManager.save();
            break;
        }
    }
    if (!removed) {
        console.error('Couldn\'t find ' + appName);
    }
}

System.ApplicationManager.runAutorunApps = function () {
    if (System.SettingsManager.loadedSources >= System.Settings.sources.length && System.SettingsManager.loadedSources != null) {
        System.SettingsManager.loadedSources = null;
        for (var i = 0; i < System.Settings.autorun.length; i++) {
            if (System.ApplicationManager.getApplicationByName(System.Settings.autorun[i])) {
                System.ApplicationManager.runByName(System.Settings.autorun[i]);
            }
        }
        System.ApplicationManager.runByName('Explorer', undefined, true);
        System.desktop.app = System.ApplicationManager.getApplicationByName('Explorer');
        System.desktop.refresh();
    }
}

/*==============================================================
SERVICES MANAGER
===============================================================*/

System.ServicesManager.load = function (service) {
    if (this.getServiceByName(service.name)) {
        for (var i = 1; ; i++) {
            if (!this.getServiceByName(service.name + i)) {
                console.error(System.Lang.services.nameConflict.format(service.name, i));
                service.name += i;
                break;
            }
        }
    }
    System.Services.push(service);
    System.SettingsManager.loadedSources++;
    System.ApplicationManager.runAutorunApps();
}

System.ServicesManager.getServiceByName = function (name) {
    for (var i = 0; i < System.Services.length; i++) {
        if (System.Services[i].name == name) return System.Services[i];
    }
    return false;
}

System.ServicesManager.start = function (service) {
    service.loop();
    service.running = true;
}

System.ServicesManager.stop = function (service) {
    clearTimeout(service.timeoutId);
    service.running = false;
}

/*==============================================================
LOCALIZATION MANAGER
===============================================================*/

System.LocalizationManager.init = function () {
    System.Lang = {};
    System.LocalizationManager.locales = [];
}

System.LocalizationManager.load = function (locale) {
    if (this.getLocaleByName(locale.name)) {
        for (var i = 1; ; i++) {
            if (!this.getLocaleByName(locale.name + i)) {
                console.error("An locale name conflict has occured with " + locale.name + ". '" + i + "' was appended to the name");
                locale.name += i;
                break;
            }
        }
    }
    this.locales.push(locale);
    this.setLanguage();
    System.SettingsManager.loadedSources++;
    System.ApplicationManager.runAutorunApps();
}

System.LocalizationManager.getLocaleByName = function (name) {
    for (var i = 0; i < this.locales.length; i++) {
        if (this.locales[i].name == name) return this.locales[i];
    }
    return false;
}

System.LocalizationManager.setLanguage = function () {
    if (System.Lang = this.getLocaleByName(System.Settings.language));
}

/*==============================================================
USER MANAGER
===============================================================*/

System.UserManager.login = function (username, password, callback) {
    $.ajax({
        type: 'POST',
        data: { username: username, password: password },
        url: System.Presets.usersController + 'login', 
        dataType: 'json',
        cache: 'false',
        success: function (r) {
            if (success(r)) {
                if (bool(r.first_run)) {
                    System.API.createDirectory('apps');
                    System.API.createDirectory('desktop');
                    System.SettingsManager.save();
                }
                else {
                    System.SettingsManager.load();
                }
            }
            if (callback !== undefined) callback(r);
        }
    });
}

System.UserManager.getUsername = function (callback) {
    $.ajax({
        type: 'POST',
        url: System.Presets.usersController + 'getUsername',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

System.UserManager.logout = function (callback) {
    $.ajax({
        type: 'POST',
        url: System.Presets.usersController + 'logout',
        dataType: 'json',
        cache: 'false',
        success: function (r) {
            if (success(r)) System.SettingsManager.init();     
            if (callback !== undefined) callback();
        }
    });
}

System.UserManager.isLogged = function (callback) {
    $.ajax({
        type: 'POST',
        url: System.Presets.usersController + 'is_logged',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

System.UserManager.register = function (username, password, password_conf, callback) {
    $.ajax({
        type: 'POST',
        data: { username: username, password: password, password_conf: password_conf },
        url: System.Presets.usersController + 'register',
        dataType: 'json',
        cache: 'false',
        success: function (r) {
            if (callback !== undefined) callback(r);
        }
    });
}

/*==============================================================
IO MANAGER
===============================================================*/

System.IOManager.init = function () {
    $(window).on('mousemove', function (e) {
        System.IOManager.mouse.position = { x: e.pageX, y: e.pageY };
    });
}

/*==============================================================
DESKTOP
===============================================================*/

System.desktop.init = function () {
    this.e = $('#desktop');
    this.field = new ItemField(0, 0, 1920, 1080, undefined, { id: 'desktop-items' });
    this.field.e.removeClass();
    this.taskbar = new Element('div', undefined, undefined, { id: 'taskbar' });
    this.time = new Element('span', undefined, undefined, {id: 'taskbar-time'});
    this.tooltip = $('#tooltip');
    this.window = $(window);
    this.app = null;
    $('title').html(System.Presets.OSName);
    this.addItem(this.field);
    this.addItem(this.taskbar);
    this.taskbar.addItem(this.time);
}

System.desktop.refresh = function () {
    this.e.css('height', this.window.height());
    this.time.e.html(this.getCurrentTime());
    this.time.setTooltip(this.getCurrentDate('{day}.{month}.{year}'));
    this.taskbar.setHeight(System.Settings.taskbarHeight);
    this.taskbar.e.children('.taskbar-app').css('width', System.Settings.taskbarItemWidth);
    this.field.setHeight(this.window.height() - System.Settings.taskbarHeight);
    if (System.Settings.desktopBackgroundPath !== '') {
        this.e.css({
            'background-image': "url('" + System.Presets.filesController + "open_file/" + System.API.encodeURI(System.Settings.desktopBackgroundPath) + "')",
            'background-size': 'cover',
            'background-repeat': 'no-repeat',
            'background-position': 'right' //FIXME PLS
        });
    }
    setTimeout(System.desktop.refresh.bind(this), 1000 / System.Settings.desktopRefreshRate);
}

System.desktop.addItem = function (item) {
    this.e.append(item.e);
}

System.desktop.getTaskbarElement = function (_window) {
    return this.taskbar.e.children('.taskbar-app[data-window-process-id=' + _window.getProcessId() + '][data-window-id=' + _window.getId() + ']');
}

System.desktop.addTaskbarElement = function (_window) {
    this.taskbar.e.append('<span data-window-process-id=' + _window.getProcessId() + ' data-window-id=' + _window.getId() + ' class="taskbar-app">' + _window.getCaption() + '</span>');
    $('.taskbar-app[data-window-process-id=' + _window.getProcessId() + '][data-window-id=' + _window.getId() + ']').on('click', function () {
        if (_window.minimized) {
            _window.unminimize();
            _window.setFocus();
        }
        else {
            _window.minimize();
        }
    });
}

System.desktop.removeTaskbarElement = function (_window) {
    this.taskbar.e.children('.taskbar-app[data-window-process-id=' + _window.getProcessId() + '][data-window-id=' + _window.getId() + ']').remove();
}

System.desktop.getCurrentTime = function () {
    var now = new Date();
    return (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
}

System.desktop.getCurrentDate = function (format) {
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();

    if (day < 10) {
        day = '0' + day;
    }

    if (month < 10) {
        month = '0' + month;
    }

    return format.formatObject({ day: day, month: month, year: year });
}

Application.prototype.SettingsManager = System.SettingsManager;
Application.prototype.ProcessManager = System.ProcessManager;
Application.prototype.ApplicationManager = System.ApplicationManager;
Application.prototype.ServicesManager = System.ServicesManager;
Application.prototype.UserManager = System.UserManager;
Application.prototype.IOManager = System.IOManager;

/*==============================================================
APPLICATION API
===============================================================*/

function Generic() { }

Generic.prototype.addItem = function (item) {
    /*var tag = item.e.prop('tagName').toLowerCase();
    var id = $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] ' + tag).length; //NAPRAWIC
    item.e.attr('data-' + tag + '-id', id);
    $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .window-content').append(item.e);*/
    if (this.e.hasClass('window')) this.e.children('.window-content').append(item.e);
    else
        this.e.append(item.e);
}

Generic.prototype.setWidth = function (width) {
    if (width > $(window).width())
        this.e.css('width', $(window).width());
    else
        this.e.css('width', width);
};

Generic.prototype.getWidth = function () {
    return parseInt(this.e.css('width'));
};

Generic.prototype.setHeight = function (height) {
    if (height > ($(window).height() - System.Settings.taskbarHeight))
        this.e.css('height', $(window).height() - System.Settings.taskbarHeight);
    else
        this.e.css('height', height);
};

Generic.prototype.getHeight = function () {
    return parseInt(this.e.css('height'));
};

Generic.prototype.setDimensions = function (width, height) {
    this.setWidth(width);
    this.setHeight(height);
}

Generic.prototype.getDimensions = function () {
    return { width: this.getWidth(), height: this.getHeight() };
}

Generic.prototype.setPosition = function (x, y) {
    this.e.css('left', x);
    this.e.css('top', y);
};

Generic.prototype.getPosition = function () {
    return { x: parseInt(this.e.css('left')), y: parseInt(this.e.css('top')) };
}

Generic.prototype.setAttribute = function (attribute, val) {
    this.e.attr(attribute, val);
}

Generic.prototype.setAttributes = function (attributes) {
    this.e.attr(attributes);
}

Generic.prototype.getAttribute = function (attribute) {
    return this.e.attr(attribute);
}

Generic.prototype.setTooltip = function (content) {
    this.e.attr('data-tooltip', content);
}

Generic.prototype.addTooltip = function (content) {
    var timeout;
    this.e.attr('data-tooltip', content);
    this.e.off('mouseenter mouseout');
    this.e.on('mouseenter', function () {  
        timeout = setTimeout(function () {
            if (this.e.is(':hover')) {
                System.desktop.tooltip.html(this.e.attr('data-tooltip')).show();
                if (System.desktop.tooltip.width() + System.IOManager.mouse.position.x > $(window).width() || System.desktop.tooltip.height() + System.IOManager.mouse.position.y > $(window).height()) {
                    System.desktop.tooltip.css({
                        'top': $(window).height() - System.desktop.tooltip.height() - 50,
                        'left': $(window).width() - System.desktop.tooltip.width() - 50
                    });
                }
                else {
                    System.desktop.tooltip.css({
                        'top': System.IOManager.mouse.position.y + 10,
                        'left': System.IOManager.mouse.position.x + 10
                    });
                }
            }
        }.bind(this), System.Settings.tooltipDelay * 1000);    
    }.bind(this));

    this.e.on('mouseout', function () {
        clearTimeout(timeout);
        System.desktop.tooltip.hide();
    });
}

Generic.prototype.removeTooltip = function () {
    this.e.off('mouseenter mouseout');
    this.e.removeAttr('data-tooltip');
}

Generic.prototype.remove = function () {
    this.e.remove();
}

Item = function (name, val, desc, handler) {
    this.name = name;
    this.val = val;
    this.desc = desc;
    this.handler = handler;
}

Option = function (text, value) {
    this.text = text;
    this.value = value;
}

Tab = function (name, items) {
    this.name = name;
    this.items = items !== undefined ? items : [];
}

Window = function (caption, width, height, attributes) {
    var e = $(document.createElement('div'));

    e.addClass('window')
     .html('<div class="window-name-div"><h1 class="window-name"></h1><div class="window-action window-action-close"></div><div class="window-action window-action-maximize"></div><div class="window-action window-action-minimize"></div></div><div class="window-content"></div>')
     .hide();
    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.content = e.find('.window-content');
    this.setAllowMinimizing(true);
    this.setAllowMaximizing(true);
    this.setAllowClosing(true);
    this.setWidth(width !== undefined ? width : System.Settings.defaultDimensions.width);
    this.setHeight(height !== undefined ? height : System.Settings.defaultDimensions.height);
    this.setCaption(caption);
    this.destroyOnClose = false;
    this.showOnTaskbar = true;
    this.maximized = false;
    this.minimized = false;
    this.opened = false;
    this.dimensionsBeforeMaximization = { width: 0, height: 0, x: 0, y: 0 };
    this.designer = function () { };
    this.main = function () { };
}

Tabs = function (x, y, width, height, tabs, attributes) {
    var e = $(document.createElement('div'));

    e.addClass('tabs')
     .html('<ul class="tabs-links"></ul><div class="tabs-content"></div>');
    e.children('.tabs-content').css({ width: width, height: height });

    if (attributes !== undefined) e.attr(attributes);

    this.e = e;
    this.setPosition(x, y);
    e.tabs();

    if (tabs !== undefined) {
        this.addTabs(tabs);
    }
}

Element = function (tag, x, y, attributes) {
    var e = $(document.createElement(tag));

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.setPosition(x, y);
}

ItemField = function (x, y, width, height, items, attributes) {
    var e = $(document.createElement('div'));

    e.addClass('item-field');

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    if (items !== undefined) this.addItems(items);
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
                var xOverlap = valueInRange(x1, pos.left, pos.left + item.width()) || valueInRange(pos.left, x1, x1 + (x2 - x1));

                var yOverlap = valueInRange(y1, pos.top, pos.top + item.height()) || valueInRange(pos.top, y1, y1 + (y2 - y1));
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
}

Button = function (text, x, y, handler, attributes) {
    var e = $(document.createElement('button'));

    e.addClass('button')
     .html(text)
     .on('click', handler);

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.setPosition(x, y);
}

List = function (options, x, y, multiple, attributes) {
    var e = $(document.createElement('select'));
    var str = '';
    for (var i = 0; i < options.length; i++) {
        str += '<option value="' + options[i].value + '">' + options[i].text + '</option>';
    }

    e.addClass('select-list')
        .html(str);

    if (multiple) e.attr('multiple', '');

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.setPosition(x, y);
}

Input = function (type, x, y, name, value, attributes) {
    var e = $(document.createElement('input'));

    e.attr('name', name)
     .attr('type', type)
     .val(value);

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.setPosition(x, y);
}

Label = function (text, x, y, attributes) {
    var e = $(document.createElement('p'));

    e.addClass('label')
     .html(text);

    if (attributes !== undefined) e.attr(attributes);
    this.e = e;
    this.setPosition(x, y);
}

Window.prototype = new Generic();
Window.prototype.constructor = Window;

Tabs.prototype = new Generic();
Tabs.prototype.constructor = Tabs;

Element.prototype = new Generic();
Element.prototype.constructor = Element;

ItemField.prototype = new Generic();
ItemField.prototype.constructor = ItemField;

Button.prototype = new Generic();
Button.prototype.constructor = Button;

List.prototype = new Generic();
List.prototype.constructor = List;

Input.prototype = new Generic();
Input.prototype.constructor = Input;

Label.prototype = new Generic();
Label.prototype.constructor = Label;

Tabs.prototype.addTab = function (tab) {
    name = tab.name.replaceAll(' ', '-')
    this.e.children('ul').append('<li><a href="#' + name + '">' + tab.name + '</a></li>');
    this.e.children('.tabs-content').append('<div id=' + name + '></div>');
    for (var i = 0; i < tab.items.length; i++) {
        this.e.find('.tabs-content #' + name).append(tab.items[i].e);
    }  
    this.e.tabs('refresh');
}

Tabs.prototype.addTabs = function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
        this.addTab(tabs[i]);
    }
}

Tab.prototype.addItem = function (item) {
    this.items.push(item);
}

ItemField.prototype.addItem = function (item) {
    var d = $(document.createElement('div'));
    var self = this;
    d.addClass('item')
            .attr('data-val', item.val)
            .html('<div class="text">' + item.name + '</div><div class="desc">' + item.desc + '</div>')
            .on('dblclick', item.handler)
            .on('mousedown', function () {
                self.e.children('.item').removeClass('selected');
                $(this).addClass('selected')
            });
    this.e.append(d);
}

ItemField.prototype.addItems = function (items) {
    for (var i = 0; i < items.length; i++) {
        this.addItem(items[i]);
    }
}

ItemField.prototype.setItems = function (items) {
    this.clear();
    for (var i = 0; i < items.length; i++) {
        this.addItem(items[i]);
    }
}

ItemField.prototype.setItem = function (item) {
    this.clear();
    this.addItem(item);
}

ItemField.prototype.removeByVal = function (val) {
    this.e.children('.item').each(function () {
        if ($(this).attr('data-val') == val) $(this).remove();
    });
}

ItemField.prototype.clear = function () {
    this.e.children('.item').remove();
}

ItemField.prototype.getSelected = function () {
    var items = [];
    this.e.children('.item.selected').each(function () {
        items.push(new Item($(this).children('.text').text(), $(this).attr('data-val'), $(this).children('.desc').text()));
    });
    return items;
}

Application.prototype.getSelectedInputValue = function (name) {
    return $('input[name=' + name + ']:checked').val();
}

Input.prototype.checked = function () {
    return this.e.prop('checked');
}

Input.prototype.getValue = function () {
    return this.e.val();
};

Input.prototype.setValue = function (val) {
    this.e.val(val);
};

List.prototype.getSelected = function () {
    var test = this.e.find('option:selected');
    if (this.e.attr('multiple')) {
        var arr = [];
        test.each(function () {
            arr.push(new Option($(this).text(), $(this).val()));
        });
        return arr;
    }
    else {
        return new Option(test.text(), test.val());
    }
}

Window.prototype.getProcessId = function () {
    return parseInt(this.e.attr('data-window-process-id'));
}

Window.prototype.getId = function () {
    return parseInt(this.e.attr('data-window-id'));
}

Window.prototype.setCaption = function (caption) {
    this.e.find('.window-name').html(caption);
    System.desktop.getTaskbarElement(this).html(caption);
}

Window.prototype.getCaption = function () {
    return this.e.find('.window-name').html();
}

Window.prototype.setAllowMinimizing = function (value) {
    this.e.attr('data-allow-minimizing', value)
}

Window.prototype.getAllowMinimizing = function () {
    return bool(this.e.attr('data-allow-minimizing'));
}

Window.prototype.setAllowMaximizing = function (value) {
    this.e.attr('data-allow-maximizing', value)
}

Window.prototype.getAllowMaximizing = function () {
    return bool(this.e.attr('data-allow-maximizing'));
}

Window.prototype.setAllowClosing = function (value) {
    this.e.attr('data-allow-closing', value)
}

Window.prototype.getAllowClosing = function () {
    return bool(this.e.attr('data-allow-closing'));
}

Window.prototype.minimize = function () {
    if (this.getAllowMinimizing()) {
        this.minimized = true;
        this.e.fadeOut(System.Settings.fadeOutTime);
    }
}

Window.prototype.unminimize = function () {
    this.minimized = false;
    this.e.fadeIn(System.Settings.fadeInTime);
}

Window.prototype.open = function () {
    if (!this.opened) {
        this.e.fadeIn(System.Settings.fadeInTime);
        this.setFocus();
        if (this.showOnTaskbar)
            System.desktop.addTaskbarElement(this);
        else
            this.setAllowMinimizing(false);
        this.designer();
        this.main();
    }
    this.opened = true;
};

Window.prototype.close = function () {
    if (this.getAllowClosing()) {
        this.opened = false;
        if (this.getMainWindow()) System.ProcessManager.killProcess(this.getProcessId());
        if (this.destroyOnClose) System.ApplicationManager.closeWindow(this.getProcessId(), this.getId());
        this.e.fadeOut(System.Settings.fadeOutTime);
        System.desktop.removeTaskbarElement(this);
        this.e.children('.window-content').children().remove();
    }
};

Window.prototype.maximize = function () {
    if (this.getAllowMaximizing()) {
        if (this.maximized) {
            this.setDimensions(this.dimensionsBeforeMaximization.width, this.dimensionsBeforeMaximization.height);
            this.setPosition(this.dimensionsBeforeMaximization.x, this.dimensionsBeforeMaximization.y);
            this.maximized = false;
        }
        else {
            this.dimensionsBeforeMaximization.width = this.getWidth();
            this.dimensionsBeforeMaximization.height = this.getHeight();
            this.dimensionsBeforeMaximization.x = this.getPosition().x;
            this.dimensionsBeforeMaximization.y = this.getPosition().y;
            this.setDimensions($(window).width(), System.desktop.field.e.height());
            this.setPosition(0, 0);
            this.maximized = true;
        }
    }
};

Window.prototype.setResizableOption = function (option, value) {
    this.e.resizable('option', option, value);
}

Window.prototype.getResizableOption = function (option) {
    return this.e.resizable('option', option);
}

Window.prototype.setMainWindow = function () {
    this.e.attr('main-window', 'true');
}

Window.prototype.getMainWindow = function (_window) {
    return this.e.attr('main-window');
}

Window.prototype.setFocus = function (z_index) {
    $('.window').css('z-index', 0);
    $('.window').removeClass('focus');
    this.e.css('z-index', z_index ? z_index : System.Settings.defaultZIndex);
    this.e.addClass('focus');
    if (this.showOnTaskbar) {
        System.desktop.taskbar.e.children('.taskbar-app').removeClass('focus');
        System.desktop.getTaskbarElement(this).addClass('focus');
    }
    else {
        System.desktop.taskbar.children('.taskbar-app').removeClass('focus');
    }
}

Window.prototype.getFocus = function () {
    return this.e.css('z-index') > 0;
}

Window.prototype.getChildrenCount = function () {
    return this.e.find('*').length;
}

Application.prototype.messageBox = function (text, icon, caption, buttons) {
    var messageBox = new Window(caption !== undefined ? caption : 'Message Box', 400, 1);
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
            width += buttons[i].getWidth() + 15;
            buttonHeight = buttons[i].getHeight();
        }
    }
    else {
        var button = new Button('OK', leftPadding, label.getHeight() + space, function () { messageBox.close(); });
        messageBox.addItem(button);
        buttonHeight = button.getHeight();    
    }
    messageBox.setPosition(($(window).width() - messageBox.getWidth()) / 2, ($(window).height() - messageBox.getHeight()) / 2);
    messageBox.setHeight(messageBox.e.find('.window-name-div').height() + label.getHeight() + buttonHeight + space + 25);
    messageBox.setFocus(200);
}

Application.prototype.desktopMessageBox = function (text, icon, caption, buttons) {
    if (System.desktop.app !== undefined) {
        System.desktop.app.messageBox(text, icon, caption, buttons);
    }
    else {
        switch (icon) {
            case 'error': console.error(text); break;
            case 'info': console.info(text); break;
            case 'warning': console.warn(text); break;
            default: console.log(text); break;
        }
    }
}

Application.prototype.prompt = function (callback, text, caption, defaultText) {
    var prompt = new Window(caption !== undefined ? caption : 'Prompt', 400, 160);
    prompt.destroyOnClose = true;
    this.addWindow(prompt);
    var label = new Label(text, 15, 15);
    var input = new Input('text', 15, 40, 'prompt-input', defaultText);
    var okBtn = new Button('OK', 15, 80, function () { callback(input.getValue()); prompt.close(); });
    var cancelBtn = new Button('Cancel', 60, 80, function () { callback(false); prompt.close(); });
    prompt.addItem(label);
    prompt.addItem(input);
    prompt.addItem(okBtn);
    prompt.addItem(cancelBtn);
    prompt.open();
}

Application.prototype.addWindow = function (_window) {
    var id = this.windows.push(_window) - 1;
    _window.e.attr('data-window-id', id);
    _window.e.attr('data-window-process-id', this.process_id);
    System.desktop.e.append(_window.e);
    _window.e
        .draggable(
            {
                handle: ".window-name-div",
                drag: function () { if (_window.maximized) _window.maximized = false; }
            })
        .resizable(
            {
                handles: "n, e, s, w, ne, se, sw, nw",
                resize: function () { if (_window.maximized) _window.maximized = false; },
                minHeight: 50,
                minWidth: 100,
                maxHeight: $(window).height(),
                maxWidth: $(window).width()
            })
        .on('mousedown', function () { _window.setFocus(); })
        .find('.window-action-close').on('click', function () {
            _window.close();
        })
        .siblings('.window-action-maximize').on('click', function () {
            _window.maximize();
        })
        .siblings('.window-action-minimize').on('click', function () {
            _window.minimize();
        });
}

Application.prototype.close = function () {
    System.ProcessManager.killProcess(this.process_id);
}

Application.prototype.uploadFromDisk = function (path, overwrite, progressElement, callback) {
    var data = new FormData();
    data.append('userfile', $('[name="userfile"]').prop('files')[0]);
    data.append('upload_path', path !== undefined ? path : '');
    data.append('upload_overwrite', overwrite !== undefined ? overwrite : false);
    $.ajax({
        xhr: function () { 
            var xhr = $.ajaxSettings.xhr();
            if (xhr.upload) { 
                xhr.upload.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        if(progressElement !== undefined) progressElement.e.attr({ value: e.loaded, max: e.total });                    
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
            $('#system-upload-progress').attr({ value: 0, max: 1 });
        },
        processData: false,
        contentType: false,
        success: callback
    });
}

Application.prototype.uploadFromUrl = function (url, path, overwrite, callback) {
    $.ajax({
        url: System.Presets.filesController + 'uploadFromUrl',
        type: 'POST',
        dataType: 'json',
        data: { upload_url: url, upload_path: path !== undefined ? path : '', upload_overwrite: overwrite !== undefined ? overwrite : false },
        cache: false,
        success: callback
    });
}

Application.prototype.downloadFile = function (fileName) {
    window.location = System.Presets.filesController + 'download_file/' + System.API.encodeURI(fileName);
}

Application.prototype.openFile = function (fileName) {
    window.open(System.Presets.filesController + 'open_file/' + System.API.encodeURI(fileName));
}

Application.prototype.writeFile = function (fileName, data, callback) {
    $.ajax({
        type: 'POST',
        data: { write_file_data: data, write_file_name: fileName},
        url: System.Presets.filesController + 'write_file',
        cache: 'false',
        success: callback
    });
}

Application.prototype.readFile = function (fileName, callback) {
    $.ajax({
        type: 'POST',
        data: { read_file_name: fileName },
        url: System.Presets.filesController + 'read_file',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

Application.prototype.deleteFile = function (fileName, callback) {
    $.ajax({
        type: 'POST',
        data: { delete_file_name: fileName },
        url: System.Presets.filesController + 'delete_file',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

Application.prototype.duplicateFile = function (filePath, destination, callback) {
    $.ajax({
        type: 'POST',
        data: { duplicate_file_name: filePath, duplicate_destination: destination },
        url: System.Presets.filesController + 'duplicate_file',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

Application.prototype.fileExists = function (filePath, callback) {
    $.ajax({
        type: 'POST',
        data: { file_exists_path: filePath },
        url: System.Presets.filesController + 'file_exists',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

Application.prototype.remoteFileExists = function (fileUrl, callback) {
    $.ajax({
        type: 'POST',
        data: { remote_file_exists_url: fileUrl },
        url: System.Presets.filesController + 'remote_file_exists',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

Application.prototype.getFilenames  = function (path, include_path, recursion, callback) {
    $.ajax({
        type: 'POST',
        data: { get_filenames_path: path, get_filenames_include_path: (include_path ? include_path : false), get_filenames_recursion: (recursion ? recursion : false) },
        url: System.Presets.filesController + 'get_filenames',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

Application.prototype.getDirFileInfo = function (path, top_level_only, recursion, callback) {
    $.ajax({
        type: 'POST',
        data: { get_dir_file_info_path: path, get_dir_file_info_top_level_only: (top_level_only ? top_level_only : false), get_dir_file_info_recursion: (recursion ? recursion : false) },
        url: System.Presets.filesController + 'get_dir_file_info',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

Application.prototype.createDirectory = function (path, mode, callback) {
    $.ajax({
        type: 'POST',
        data: { create_dir_path: path, create_dir_mode: (mode !== undefined ? mode : 0700) },
        url: System.Presets.filesController + 'create_dir',
        cache: 'false',
        success: callback
    });
}

Application.prototype.encodeURI = function (path) {
    return path.replaceAll('/', '+').replaceAll(' ', '_');
}

Application.prototype.isFile = function(path) { //REWRITE TO PHP
    return path.split('/').pop().split('.').length > 1;
}

Application.prototype.getFilenameFromPath = function (path) {
    return path.replace(/^.*[\\\/]/, '');
}

Application.prototype.getUserPathByServerPath = function(path, trailing) {
    var urlChunks = path.split('/');
    var str = '';
    for (var i = 2; i < urlChunks.length; i++) {
        str += urlChunks[i] + '/';
    }
    return trailing ? str : str.slice(0, -1);
}

Application.prototype.saveSettings = function (settings) {
    settings.appName = this.name;
    var alreadySaved = false;
    for (var i = 0; i < System.Settings.applicationSettings.length; i++) {
        if (System.Settings.applicationSettings[i].appName == this.name) {
            var obj = System.Settings.applicationSettings[i];
            for (var name in settings) {
                obj[name] = settings[name];
            }
            alreadySaved = true;
            break;
        }
    }
    if (!alreadySaved) {
        System.Settings.applicationSettings.push(settings);
    }
}

Application.prototype.loadSettings = function (settings) {
    for (var i = 0; i < System.Settings.applicationSettings.length; i++) {
        if (System.Settings.applicationSettings[i].appName == this.name) {
            var obj = System.Settings.applicationSettings[i];
            for (var name in obj) {
                settings[name] = obj[name];
            }
            break;
        }
    }
}

Process.prototype.getChildrenCount = function () {
    var num = 0;
    for (var i = 0; i < this.app.windows.length; i++) {
        num += this.app.windows[i].getChildrenCount();
    }
    return num;
}

Process.prototype.kill = function () {
    System.ProcessManager.killProcess(this.id);
}

Service.prototype.start = function () {
    this.loop();
    this.running = true;
}

Service.prototype.stop = function () {
    clearTimeout(this.timeoutId);
    this.running = false;
}

window.onerror = function (error, url, line) {
    System.API.desktopMessageBox(error + ' in ' + url + ' at ' + line, 'error', 'Error');
};

//console.error = function (error) { System.desktop.app.messageBox(error, 'error', 'Error'); };

window.onload = function () {
    System.Init();
}