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
    var errors = r.message;
    if (typeof errors === 'object') {
        for (var key in errors) {
            text += '<div>' + errors[key] + '</div>';
        }
    }
    else {
        text = '<div>' + errors + '</div>';
    }
    return text;
}

function insensitiveCmp(str1, str2) {
    return str1.toUpperCase() == str2.toUpperCase();
}

System = {};

System.SettingsManager = {};
System.Settings = {};
System.Presets = {};
System.Info = {};
System.UserManager = {};
System.ProcessManager = { id_counter: 0, process_ids: [] };
System.ApplicationManager = {};
System.ServicesManager = {};
System.Applications = [];
System.Processes = [];
System.Services = [];

System.Init = function () {
    this.SettingsManager.init()
    this.Presets.init();
    System.desktop = new Desktop();
    this.ApplicationManager.run(System.ApplicationManager.getApplicationByName('Explorer'), true);
    System.desktop.app = System.ApplicationManager.getApplicationByName('Explorer');
    System.SettingsManager.load();
    System.ApplicationManager.runAutorunApps();
    this.ApplicationManager.refresh();
    this.desktop.refresh();   
}

System.SettingsManager.init = function () {
    System.Settings.defaultDimensions = { width: 640, height: 480 };
    System.Settings.fadeInTime = 200;
    System.Settings.fadeOutTime = 200;
    System.Settings.taskbarHeight = 40;
    System.Settings.desktopRefreshRate = 5;
    System.Settings.autorun = ['Login'];
    System.Settings.autorunTimeout = 1;
    System.Settings.applicationRefreshRate = 5;
    System.Settings.applicationSources = [{filePath: '/system-apps/login.js', external: true}];
    System.Settings.applicationSettings = [];
}

System.Presets.init = function () {
    System.Presets.controllerName = 'systemt';
}

Process = function (id, app, run_by) {
    this.id = id;
    this.app = app;
    this.run_by = run_by;
}

Application = function (name) {
    this.process_id = 0;
    this.name = name;
    this.windows = [];

    this.main = function () { };
}

Service = function (name) {
    this.name = name;
    this.running = false;
}

/*==============================================================
SETTINGS MANAGER
===============================================================*/

System.SettingsManager.load = function () {
    System.desktop.app.readFile('settings.cfg', function (r) {
        if (bool(r.success)) {
            var obj = JSON.parse(r.data);
            for (name in obj) {
                System.Settings[name] = obj[name];
            }       
        }
    });
    System.ApplicationManager.loadFromSettings();
}

System.SettingsManager.save = function () {
    System.desktop.app.writeFile('settings.cfg', JSON.stringify(System.Settings, null, '\t'));
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
    var _app = app;
    for (var i = 0; i < System.Applications.length; i++) {
        if (System.Applications[i].name == _app.name) {
            console.error('An app name conflict has occured with ' + _app.name + '. \'2\' was appended to the name');
            _app.name += '2';
        }
    }
    System.Applications.push(_app);
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

System.ApplicationManager.refresh = function () {
    for (var i = 0; i < System.Processes.length; i++) {
        var id = System.ProcessManager.getProcessIds()[i];
        var process = System.ProcessManager.getProcessById(id);

        for (var j = 0; j < System.Processes[i].app.windows.length; j++) {
            var _window = System.Processes[i].app.windows[j];

            if (_window.maximized && _window.getPosition().x == 0 && _window.getPosition().y == 0) _window.e.find('.window-action-maximize').css('background-image', 'url("res/maximize2.png")');
            else
                _window.e.find('.window-action-maximize').css('background-image', 'url("res/maximize.png")');
        }
    }
    setTimeout(System.ApplicationManager.refresh, 1000 / System.Settings.applicationRefreshRate);
}

System.ApplicationManager.run = function (app, system) {
    if (app) {
        var id = System.ProcessManager.getFreeId();
        System.UserManager.getUsername(function (r) {
            var run_by = '';
            if (!system) {
                if (bool(r.success)) {
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
            app.main();
        });
    }
    else {
        System.desktop.app.messageBox('Couldn\'t run that app', 'error', 'Error');
    }
}

System.ApplicationManager.addAutorunApp = function (appName) {
    var added = false;
    for (var i = 0; i < System.Settings.autorun.length; i++) {
        if (System.Settings.autorun[i] == appName) {
            added = true;
            console.error(appName + ' is already added to Autorun');
            break;
        }
    }
    if (!added) {
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
    var time = 10;
    var timeout = System.Settings.autorunTimeout * 1000 / time;
    var repetitions = 0;
    var runApps = [];
    function check(id) {
        for (var i = 0; i < System.Settings.autorun.length; i++) {
            if (System.ApplicationManager.getApplicationByName(System.Settings.autorun[i]) && $.inArray(System.Settings.autorun[i], runApps) == -1) {
                System.ApplicationManager.run(System.ApplicationManager.getApplicationByName(System.Settings.autorun[i]));
                runApps.push(System.Settings.autorun[i]);
            }
        }
        if (repetitions >= timeout) clearInterval(id);
        console.log('xd');
        repetitions++;
    }
    var id = setInterval(function () { check(id) }, time);
}

System.ApplicationManager.install = function (filePath, external) {
    var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
    var installed = false;
    for (var i = 0; i < System.Settings.applicationSources.length; i++) {
        if (System.Settings.applicationSources[i].filePath == filePath) {
            installed = true;
            console.error(fileName + ' is already installed');
            break;
        }
    }
    if (!installed) {
        System.UserManager.isLogged(function (r) {
            if (bool(r.success)) {
                System.ApplicationManager.loadFile(filePath, external);
                System.Settings.applicationSources.push({ filePath: filePath, external: external ? external : false });
                System.SettingsManager.save();
                console.info(fileName + ' installed');
            }
            else {
                System.desktop.app.messageBox('You\'re not logged in', 'error', 'Error');
            }
        });      
    }
}

System.ApplicationManager.uninstall = function (filePath) {
    var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
    var unistalled = false;
    for (var i = 0; i < System.Settings.applicationSources.length; i++) {
        if (System.Settings.applicationSources[i].filePath == filePath) {
            var unloaded = false;
            $('head script').each(function () {
                if ($(this).attr('data-app-path') == filePath) {
                    $(this).remove();
                    unloaded = true;
                    console.info(fileName + ' unloaded');
                }
            });
            if (!unloaded) console.error('Couldn\'t find ' + fileName);
            System.Settings.applicationSources.splice(i, 1);
            System.SettingsManager.save();
            console.info(fileName + ' uninstalled');
            unistalled = true;
            break;
        }
    }
    if (!unistalled) console.error('Couldn\'t find ' + fileName);
}

System.ApplicationManager.loadFile = function (filePath, external) {
    var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
    var loaded = false;
    $('head script').each(function () {
        if ($(this).attr('data-app-path') == filePath) {
            console.error(fileName + ' is already loaded');
            loaded = true;
        }
    });
    if (!loaded) {
        if (!external) {
            System.desktop.app.readFile(filePath, function (r) {
                if (bool(r.success)) {
                    var app = document.createElement('script');
                    app.text = r.data;
                    app.setAttribute('data-app-path', filePath);
                    document.head.appendChild(app);
                    console.info(fileName + ' loaded');
                }
            });
        }
        else {
            var app = document.createElement('script');
            app.src = filePath;
            app.setAttribute('data-app-path', filePath);
            document.head.appendChild(app);
            console.info(fileName + ' loaded');
        }
    }
}

System.ApplicationManager.loadFromSettings = function () {
    for (var i = 0; i < System.Settings.applicationSources.length; i++) {
        this.loadFile(System.Settings.applicationSources[i].filePath, System.Settings.applicationSources[i].external)
    }
}

/*==============================================================
USER MANAGER
===============================================================*/

System.UserManager.login = function (username, password, callback) {
    $.ajax({
        type: 'POST',
        data: { username: username, password: password },
        url: '/' + System.Presets.controllerName + '/login', 
        dataType: 'json',
        cache: 'false',
        success: function (r) {
            if (bool(r.success)) {
                if (bool(r.first_run)) {
                    System.desktop.app.createDirectory('apps');
                    System.SettingsManager.save();
                }
                else {
                    System.SettingsManager.load();
                }
            }
            if (callback) callback(r);
        }
    });
}

System.UserManager.getUsername = function (callback) {
    $.ajax({
        type: 'POST',
        url: '/' + System.Presets.controllerName + '/getUsername',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

System.UserManager.logout = function () {
    $.ajax({
        type: 'POST',
        url: '/' + System.Presets.controllerName + '/logout',
        dataType: 'text',
        cache: 'false'
    });
}

System.UserManager.isLogged = function (callback) {
    $.ajax({
        type: 'POST',
        url: '/' + System.Presets.controllerName + '/is_logged',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

System.UserManager.register = function (username, password, password_conf, callback) {
    $.ajax({
        type: 'POST',
        data: { username: username, password: password, password_conf: password_conf },
        url: '/' + System.Presets.controllerName + '/register',
        dataType: 'json',
        cache: 'false',
        success: function (r) {
            if (bool(r.success)) {
                System.desktop.app.createDirectory(username, undefined, true);
            }
            if (callback != undefined) callback(r);
        }
    });
}

/*==============================================================
SERVICES MANAGER
===============================================================*/

System.ServicesManager.load = function (service) {
    System.Services.push(service);
}

System.ServicesManager.run = function (service) {
    service.main();
    service.running = true;
}

System.ServicesManager.stop = function (service) {
    service.main();
    service.running = true;
}

/*==============================================================
DESKTOP
===============================================================*/

Desktop = function () {
    this.e = $('#desktop');
    this.field = new ItemField(0, 0, 0, 0);
    this.taskbar = $('#taskbar');
    this.app = null;
    var data = this;

    this.field.e = $('#desktop-items');

    this.setBackgroundColor = function (color) {
        this.e.css('background-color', color);
    }

    this.refresh = function () {
        data.e.css('height', $(window).height());
        data.taskbar.children('#taskbar-time').html(data.getCurrentTime());
        data.taskbar.css('height', System.Settings.taskbarHeight);
        data.field.e.css('height', $(window).height() - System.Settings.taskbarHeight);
        setTimeout(System.desktop.refresh, 1000 / System.Settings.desktopRefreshRate);
    }

    this.addTaskbarElement = function (_window) {
        this.taskbar.append('<span data-window-process-id=' + _window.getProcessId() + ' data-window-id=' + _window.getId() + ' class="taskbar-app">' + _window.getCaption() + '</span>');
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

    this.removeTaskbarElement = function (_window) {
        this.taskbar.find('.taskbar-app[data-window-process-id=' + _window.getProcessId() + '][data-window-id=' + _window.getId() + ']').remove();
    }

    this.setTaskbarElementCaption = function (_window, caption) {
        this.taskbar.find('.taskbar-app[data-window-process-id=' + _window.getProcessId() + '][data-window-id=' + _window.getId() + ']').html(caption);
    }

    this.getCurrentTime = function () {
        var now = new Date();
        return (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    }
}

Application.prototype.systemInfo = System.Info;
Application.prototype.SettingsManager = System.SettingsManager;
Application.prototype.UserManager = System.UserManager;
Application.prototype.ProcessManager = System.ProcessManager;
Application.prototype.ApplicationManager = System.ApplicationManager;

/*==============================================================
APPLICATION API
===============================================================*/

function Generic() { };

Generic.prototype.setWidth = function (width) {
    this.e.css('width', width);
};

Generic.prototype.getWidth = function () {
    return parseInt(this.e.css('width'));
};

Generic.prototype.setHeight = function (height) {
    this.e.css('height', height);
};

Generic.prototype.getHeight = function () {
    return parseInt(this.e.css('height'));
};

Generic.prototype.setPosition = function (x, y) {
    this.e.css('left', x);
    this.e.css('top', y);
};

Generic.prototype.getPosition = function () {
    return { x: parseInt(this.e.css('left')), y: parseInt(this.e.css('top')) };
}

Generic.prototype.on = function (events, selector, data, handler) {
    this.e.on(events, selector, data, handler);
}

Generic.prototype.off = function (events, selector, handler) {
    this.e.off(events, selector, handler);
}

Generic.prototype.remove = function () {
    this.e.remove();
}

Window = function (caption, width, height) {
    this.type = 'window';
    var e = $(document.createElement('div'));

    e.addClass('window')
     .html('<div class="window-name-div"><h1 class="window-name">' + caption + '</h1><div class="window-action window-action-close"></div><div class="window-action window-action-maximize"></div><div class="window-action window-action-minimize"></div></div><div class="window-content"></div>')
     .hide()
     .css('width', width ? width : System.Settings.defaultDimensions.width)
     .css('height', height ? height : System.Settings.defaultDimensions.height);
    this.e = e;
    this.destroyOnClose = false;
    this.showOnTaskbar = true;
    this.maximized = false;
    this.minimized = false;
    this.opened = false;
    this.dimensionsBeforeMaximization = { width: 0, height: 0, x: 0, y: 0 };
    this.designer = function () { };
    this.main = function () { };
}

Element = function (tag, x, y, attributes) {
    this.type = tag;
    var e = $(document.createElement(tag));

    e.css('top', y != undefined ? y : '')
     .css('left', x != undefined ? x : '');

    if (attributes != undefined) e.attr(attributes);

    this.e = e;
}

ItemField = function (x, y, width, height) {
    this.type = 'item-field';
    var e = $(document.createElement('div'));

    e.addClass('item-field')
     .css('top', y)
     .css('left', x)
     .css('width', width)
     .css('height', height);
    this.e = e;
}

Item = function (name, val, desc, handler) {
    this.name = name;
    this.val = val;
    this.desc = desc;
    this.handler = handler;
}

Button = function (text, x, y, handler) {
    this.type = 'button';
    var e = $(document.createElement('button'));

    e.addClass('button')
     .html(text)
     .css('top', y != undefined ? y : '')
     .css('left', x != undefined ? x : '')
     .on('click', handler);
    this.e = e;
}

List = function (options, x, y, multiple) {
    this.type = 'list';
    var e = $(document.createElement('select'));
    var str = '';
    for (var i = 0; i < options.length; i++) {
        str += '<option value="' + options[i].value + '">' + options[i].text + '</option>';
    }

    e.addClass('select-list')
        .html(str)
        .css('top', y)
        .css('left', x);

    if (multiple) e.attr('multiple', '');

    this.e = e;
}

Input = function (type, x, y, name, value, attributes) {
    this.type = 'input';
    var e = $(document.createElement('input'));

    e.attr('name', name)
     .attr('type', type)
     .val(value)
     .css('top', y)
     .css('left', x);

    if (attributes != undefined) e.attr(attributes);
    this.e = e;
}

Label = function (text, x, y) {
    this.type = 'label';
    var e = $(document.createElement('p'));

    e.addClass('label')
     .html(text)
     .css('top', y)
     .css('left', x);
    this.e = e;
}

Option = function (text, value) {
    this.text = text;
    this.value = value;
}

Window.prototype = new Generic();
Window.prototype.constructor = Window;

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

ItemField.prototype.addItem = function (item) {
    var d = $(document.createElement('div'));
    var self = this;
    d.addClass('item')
            .attr('data-val', item.val)
            .html('<div class="text">' + item.name + '</div><div class="desc">' + item.desc + '</div>')
            .on('dblclick', item.handler)
            .on('click', function () {
                self.e.children('.item').removeClass('selected');
                $(this).addClass('selected')
            });
    /*this.e.on('click', function () {
        self.e.children('.item').removeClass('selected');
    });*/
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
    System.desktop.setTaskbarElementCaption(this, caption);
}

Window.prototype.getCaption = function () {
    return this.e.find('.window-name').html();
}

Window.prototype.minimize = function () {
    this.minimized = true;
    this.e.fadeOut(System.Settings.fadeOutTime);
}

Window.prototype.unminimize = function () {
    this.minimized = false;
    this.e.fadeIn(System.Settings.fadeInTime);
}

Window.prototype.open = function () {
    if (!this.opened) {
        this.e.fadeIn(System.Settings.fadeInTime);
        this.setFocus();
        if (this.showOnTaskbar) System.desktop.addTaskbarElement(this);
        this.designer();
        this.main();
    }
    this.opened = true;
};

Window.prototype.close = function () {
    this.opened = false;
    if (this.getMainWindow()) System.ProcessManager.killProcess(this.getProcessId());
    if (this.destroyOnClose) System.ApplicationManager.closeWindow(this.getProcessId(), this.getId());
    this.e.fadeOut(System.Settings.fadeOutTime);
    System.desktop.removeTaskbarElement(this);
    this.e.find('.window-content').children().remove();
};

Window.prototype.maximize = function () {
    if (this.maximized) {
        this.setWidth(this.dimensionsBeforeMaximization.width);
        this.setHeight(this.dimensionsBeforeMaximization.height);
        this.setPosition(this.dimensionsBeforeMaximization.x, this.dimensionsBeforeMaximization.y);
        this.maximized = false;
    }
    else {
        this.dimensionsBeforeMaximization.width = this.getWidth();
        this.dimensionsBeforeMaximization.height = this.getHeight();
        this.dimensionsBeforeMaximization.x = this.getPosition().x;
        this.dimensionsBeforeMaximization.y = this.getPosition().y;
        this.setWidth($(window).width() - 4);
        this.setHeight($(window).height() - 4);
        this.setPosition(0, 0);
        this.maximized = true;
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
    this.e.css('z-index', z_index ? z_index : 100);
    this.e.addClass('focus');
}

Window.prototype.getFocus = function () {
    return this.e.css('z-index') > 0;
}

Window.prototype.getChildrenCount = function () {
    return this.e.find('*').length;
}

Window.prototype.addItem = function (item) {
    var tag = item.e.prop('tagName').toLowerCase();
    var id = $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] ' + tag).length; //NAPRAWIC
    item.e.attr('data-' + tag + '-id', id);
    $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .window-content').append(item.e);
}

Application.prototype.messageBox = function (text, icon, caption, buttons) {
    var messageBox = new Window(caption != undefined ? caption : 'Message Box', 400, 160);
    messageBox.destroyOnClose = true;
    this.addWindow(messageBox);
    var label = new Label(text, icon != undefined ? 52 : 15, 15);
    messageBox.addItem(label);
    if (buttons != undefined) {
        for (var i = 0; i < buttons.length; i++) {
            messageBox.addItem(buttons[i]);
            buttons[i].setPosition(i * 100 + 15, messageBox.getHeight() - 80);
        }
    }
    else {
        messageBox.addItem(new Button('OK', 15, messageBox.getHeight() - 80, function () { messageBox.close(); }));
    }
    messageBox.e.addClass('messagebox');
    messageBox.e.addClass(icon);
    messageBox.setPosition(($(window).width() - messageBox.getWidth()) / 2, ($(window).height() - messageBox.getHeight()) / 2);
    messageBox.open();
    messageBox.setFocus(200);
}

Application.prototype.prompt = function (callback, text, caption, defaultText) {
    var prompt = new Window(caption != undefined ? caption : 'Prompt', 400, 160);
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
    var data = this;
    var id = this.windows.push(_window) - 1;
    _window.e.attr('data-window-id', id);
    _window.e.attr('data-window-process-id', this.process_id);
    $('#desktop').append(_window.e);
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
                minWidth: 100
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

function progressHandlingFunction(e) {
    if (e.lengthComputable) {
        $('#system-upload-progress').attr({ value: e.loaded, max: e.total });
    }
}

Application.prototype.upload = function (path, callback) {
    var data = new FormData();
    data.append('userfile', $('[name="userfile"]').prop('files')[0]);
    data.append('upload_path', path != undefined ? path : '');
    $.ajax({
        xhr: function () { 
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) { 
                myXhr.upload.addEventListener('progress', progressHandlingFunction, false);
            }
            return myXhr;
        },
        url: '/' + System.Presets.controllerName + '/upload',
        type: 'POST',
        dataType: 'json',
        data: data,
        cache: false,
        beforeSend: function () {
            $('progress').attr({ value: 0, max: 1 });
        },
        processData: false,
        contentType: false,
        success: function (r) {
            if (bool(r.success)) {
                System.desktop.app.messageBox('File uploaded successfully', 'tick');
            }
            else {
                System.desktop.app.messageBox('An error occurred while trying to upload the file' + showMessage(r), 'error');
                $('progress').attr({ value: 0, max: 1 });
            }
            if(callback != undefined) callback(r);
        }
    });
}

Application.prototype.downloadFile = function (fileName) {
    window.location = '/' + System.Presets.controllerName + '/download_file/' + fileName;
}

Application.prototype.openFile = function (fileName) {
    window.location = '/' + System.Presets.controllerName + '/open_file/' + fileName.replace('/', '+');
}

Application.prototype.writeFile = function (fileName, data, callback) {
    $.ajax({
        type: 'POST',
        data: { write_file_data: data, write_file_name: fileName},
        url: '/' + System.Presets.controllerName + '/write_file',
        cache: 'false',
        success: function (r) {
            if (callback != undefined) callback(r);
        }
    });
}

Application.prototype.readFile = function (fileName, callback) {
    $.ajax({
        async: false,
        type: 'POST',
        data: { read_file_name: fileName },
        url: '/' + System.Presets.controllerName + '/read_file',
        dataType: 'json',
        cache: 'false',
        success: callback
    });
}

Application.prototype.deleteFile = function (fileName, callback) {
    $.ajax({
        async: false,
        type: 'POST',
        data: { delete_file_name: fileName },
        url: '/' + System.Presets.controllerName + '/delete_file',
        dataType: 'json',
        cache: 'false',
        success: function (r) {
            if (callback != undefined) callback(r);
        }
    });
}

Application.prototype.createDirectory = function (path, mode, absolute, callback) {
    $.ajax({
        type: 'POST',
        data: { create_dir_path: path, create_dir_mode: (mode != undefined ? mode : 0700), create_dir_absolute: (absolute != undefined ? true : '') },
        url: '/' + System.Presets.controllerName + '/create_dir',
        cache: 'false',
        success: callback
    });
}

Application.prototype.saveSettings = function (settings) {
    settings.appName = this.name;
    var alreadySaved = false;
    for (var i = 0; i < System.Settings.applicationSettings.length; i++) {
        if (System.Settings.applicationSettings[i].appName == this.name) {
            var obj = System.Settings.applicationSettings[i];
            for (name in settings) {
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
            for (name in obj) {
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

window.onerror = function (error, url, line) {
    System.desktop.app.messageBox(error, 'error', 'Error');
};

//console.error = function (error) { System.desktop.app.messageBox(error, 'error', 'Error'); };

window.onload = function () {
    System.Init();
}