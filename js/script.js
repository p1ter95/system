﻿function bool(val) {
    if (val == 'true') {
        return true;
    }
    else if (val == 'false') {
        return false;
    }
}

System = {};

System.Settings = {};
System.Info = {};
System.UserManager = {};
System.ProcessManager = { id_counter: 0, process_ids: [] };
System.ApplicationManager = {};
System.Applications = [];
System.Processes = [];

System.initSettings = function () {
    System.Settings.defaultDimensions = { width: 640, height: 480 };
    System.Settings.fadeInTime = 200;
    System.Settings.fadeOutTime = 200;
    System.Settings.taskbarHeight = 40;
    System.Settings.desktopRefreshRate = 5;
    System.Settings.applicationRefreshRate = 5;
}

System.loadSettings = function (settings) {
    System.Settings = settings;
}

System.Init = function () {
    this.initSettings();
    System.desktop = new Desktop();
    System.desktop.createTaskbar();  
    this.ApplicationManager.load(app1);
    this.ApplicationManager.load(app2);
    this.ApplicationManager.load(explorer);
    this.ApplicationManager.load(login);
    this.ApplicationManager.run(this.Applications[0]);
    this.ApplicationManager.run(this.Applications[1]);
    this.ApplicationManager.run(this.Applications[2]);
    System.desktop.app = System.ApplicationManager.getApplicationByName('Explorer');
    this.ApplicationManager.refresh();
    this.desktop.refresh();
}


System.UserManager.login = function (username, password, callback) {
    $.ajax({
        type: 'POST',
        data: { username: username, password: password },
        url: '/systemt/login',
        dataType: 'text',
        cache: 'false',
        success: function (r) {
            if (bool(r)) System.desktop.app.readFile('settings.cfg', function (re) { System.loadSettings(JSON.parse(re)) });
            callback(r);
        }
    });
}

System.UserManager.logout = function () {
    $.ajax({
        type: 'POST',
        url: '/systemt/logout',
        dataType: 'text',
        cache: 'false',
    });
}

System.UserManager.register = function (username, password, password_conf, callback) {
    $.ajax({
        type: 'POST',
        data: { username: username, password: password, password_conf: password_conf },
        url: '/systemt/register',
        dataType: 'json',
        cache: 'false',
        success: function (r) {
            if (bool(r.success)) {
                System.desktop.app.createDirectory(username, undefined, true);
                System.desktop.app.writeFile(username + '/settings.cfg', JSON.stringify(System.Settings), true);
            }
            if (callback != undefined) callback(r);
        }
    });
}

Application = function (name) {
    this.process_id = 0;
    this.name = name;
    this.windows = [];

    this.main = function () { };
}

Application.prototype.systemInfo = System.Info;
Application.prototype.systemSettings = System.Settings;
Application.prototype.UserManager = System.UserManager;
Application.prototype.ProcessManager = System.ProcessManager;
Application.prototype.ApplicationManager = System.ApplicationManager;

Desktop = function () {
    this.e = $('#desktop');
    this.d = $('#desktop-elements');
    this.app = null;
    this.taskbar = null;
    var data = this;
    this.setBackgroundColor = function (color) {
        this.e.css('background-color', color);
    }
    this.refresh = function () {
        data.e.css('height', $(window).height());
        data.taskbar.children('#taskbar-time').html(data.getCurrentTime());
        data.taskbar.css('height', System.Settings.taskbarHeight);
        data.d.css('height', $(window).height() - System.Settings.taskbarHeight);
        setTimeout(System.desktop.refresh, 1000 / System.Settings.desktopRefreshRate);
    }

    this.createTaskbar = function () {
        var e = $(document.createElement('div'));

        e.attr('id', 'taskbar')
            .html('<span id="taskbar-time"></span>');
        this.taskbar = e;
        this.e.append(this.taskbar);
    }

    this.addElement = function (element, field) {
        var d = $(document.createElement('div'));
        d.addClass('element')
                .append('<div class="text">' + element.text + '<div class="desc">' + element.desc + '</div></div>')
                .on('dblclick', element.handler)
                .on('click', function () {
                    $('.element').removeClass('selected');
                    $(this).addClass('selected')
                });

        field.append(d);
    }

    this.addElements = function (elements, field) {
        for (var i = 0; i < elements.length; i++) {
            this.addElement(elements[i], field);
        }
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

/**************************************************************
***********************APPLICATION CONTROLS********************
**************************************************************/

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

ElementField = function (x, y, width, height, elements) {
    this.type = 'element-field';
    var e = $(document.createElement('div'));

    System.desktop.addElements(elements, e);

    e.addClass('element-field')
     .css('top', y)
     .css('left', x)
     .css('width', width)
     .css('height', height)
    this.e = e;
}

Element = function (text, desc, handler) {
    this.text = text;
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
        .css('left', x)

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
     .css('left', x)

    for (var property in attributes) {
        var value = attributes[property];
        e.attr(property, value);
    }
    this.e = e;
}

Label = function (text, x, y) {
    this.type = 'label';
    var e = $(document.createElement('p'));

    e.addClass('label')
     .html(text)
     .css('top', y)
     .css('left', x)
    this.e = e;
}

Option = function (text, value) {
    this.text = text;
    this.value = value;
}

Window.prototype = new Generic();
Window.prototype.constructor = Window;

ElementField.prototype = new Generic();
ElementField.prototype.constructor = ElementField;

Button.prototype = new Generic();
Button.prototype.constructor = Button;

List.prototype = new Generic();
List.prototype.constructor = List;

Input.prototype = new Generic();
Input.prototype.constructor = Input;

Label.prototype = new Generic();
Label.prototype.constructor = Label;

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
    this.e.css('z-index', z_index ? z_index : 100);
}

Window.prototype.getChildrenCount = function () {
    return this.e.find('*').length;
}

Window.prototype.addItem = function (item) {
    switch (item.type) {
        case 'element-field':
            var id = $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .element-field').length;
            item.e.attr('data-element-field-id', id);
            $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .window-content').append(item.e);
            break;
        case 'button':
            var id = $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .button').length;
            item.e.attr('data-button-id', id);
            $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .window-content').append(item.e);
            break;
        case 'list':
            var id = $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .select-list').length;
            item.e.attr('data-select-list-id', id);
            $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .window-content').append(item.e);
            break;
        case 'input':
            var id = $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] input').length;
            item.e.attr('data-input-id', id);
            $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .window-content').append(item.e);
            break;
        case 'label':
            var id = $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .label').length;
            item.e.attr('data-label-id', id);
            $('[data-window-process-id=' + this.getProcessId() + '][data-window-id=' + this.getId() + '] .window-content').append(item.e);
            break;
    }
}

Application.prototype.messageBox = function (text, icon, buttons, caption) {
    var messageBox = new Window(caption != undefined ? caption : 'Message Box', 400, 160);
    messageBox.destroyOnClose = true;
    this.addWindow(messageBox);
    var label = new Label(text, icon != undefined ? 52 : 15, 15);
    this.addItem(label, messageBox);
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

Application.prototype.prompt = function (object, text, caption, defaultText) {
    var prompt = new Window(caption != undefined ? caption : 'Prompt', 400, 160);
    prompt.destroyOnClose = true;
    this.addWindow(prompt);
    var label = new Label(text, 15, 15);
    var input = new Input('text', 15, 40, 'prompt-input', defaultText);
    var okBtn = new Button('OK', 15, 80, function () { object.val = input.getValue(); prompt.close(); });
    var cancelBtn = new Button('Cancel', 60, 80, function () { object.val = false; prompt.close(); });
    this.addItem(label, prompt);
    this.addItem(input, prompt);
    this.addItem(okBtn, prompt);
    this.addItem(cancelBtn, prompt);
    prompt.open();
}

Application.prototype.addItem = function (item, _window) {
    switch (item.type) {
        case 'element-field':
            var id = $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] .element-field').length;
            item.e.attr('data-element-field-id', id);
            $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] .window-content').append(item.e);
            break;
        case 'button':
            var id = $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] .button').length;
            item.e.attr('data-button-id', id);
            $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] .window-content').append(item.e);
            break;
        case 'list':
            var id = $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] .select-list').length;
            item.e.attr('data-select-list-id', id);
            $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] .window-content').append(item.e);
            break;
        case 'input':
            var id = $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] input').length;
            item.e.attr('data-input-id', id);
            $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] .window-content').append(item.e);
            break;
        case 'label':
            var id = $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] .label').length;
            item.e.attr('data-label-id', id);
            $('[data-window-process-id=' + this.process_id + '][data-window-id=' + _window.getId() + '] .window-content').append(item.e);
            break;
    }
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

Application.prototype.writeFile = function (fileName, data, absolute) {
    $.ajax({
        type: 'POST',
        data: { write_file_data: data, write_file_name: fileName, write_file_absolute: (absolute != undefined ? true : '') },
        url: '/systemt/write_file',
        cache: 'false',
        success: function (response) {
            console.info('File writing succeded');
        }
    });
}

Application.prototype.readFile = function (fileName, callback) {
    $.ajax({
        async: false,
        type: 'POST',
        data: { read_file_name: fileName },
        url: '/systemt/read_file',
        dataType: 'text',
        cache: 'false',
        success: callback
    });
}

Application.prototype.createDirectory = function (path, mode, absolute, callback) {
    $.ajax({
        type: 'POST',
        data: { create_dir_path: path, create_dir_mode: (mode != undefined ? mode : 777), create_dir_absolute: (absolute != undefined ? true : '') },
        url: '/systemt/create_dir',
        cache: 'false',
        success: callback
    });
}
app1 = new Application('test');

app1.main = function () {
    var data = this;
    var _window = new Window('app1 win1', 640, 480);
    _window.showOnTaskbar = false;
    var _window2 = new Window('app1 win2', 640, 480);
    _window.setMainWindow();
    this.addWindow(_window);
    this.addWindow(_window2);
    var button1 = new Button('zmiana wielkosci', 55, 200, function () {
        data.createDirectory('folder', undefined, function (r) {
            if (bool(r)) data.messageBox('git', 'info', 'git')
            else {
                data.messageBox('error', 'error', 'error')
            }
        });
    });
    this.addItem(button1, _window);
    var button2 = new Button('co wybralem w pierwszym', 100, 120, function () { data.messageBox(list1.getSelected().text) });
    this.addItem(button2, _window);
    var button3 = new Button('zapisz tresc wybranej opcji na serwer', 100, 200, function () { data.writeFile('lol.txt', list1.getSelected().text) });
    this.addItem(button3, _window2);
    var button4 = new Button('odczytaj co jest w pliku lol.txt', 100, 240, function () { data.messageBox(data.readFile('lol.txt')); });
    this.addItem(button4, _window2);
    var button5 = new Button('zmien x', 100, 150, function () { data.messageBox(list2.e.attr('data-select-list-id'), 'warning'); });
    this.addItem(button5, _window);

    var field = new ElementField(5, 5, 400, 200, [new Element('textt', 'desc', function () { data.messageBox('xD') }), new Element('haha2', 'desc2', function () { })]);
    this.addItem(field, _window);

    var radio1 = new Input('radio', 20, 330, 'test', 'val1');
    this.addItem(radio1, _window);

    var radio2 = new Input('radio', 20, 350, 'test', 'val2');
    this.addItem(radio2, _window);

    var selected = new Button('co wybralem', 50, 350, function () { data.messageBox(data.getSelectedInputValue('test')); });
    this.addItem(selected, _window);

    var bgInput = new Input('text', 450, 40, 'bgColor');
    this.addItem(bgInput, _window);

    var btnSetBg = new Button('zmien tapete', 450, 80, function () { System.desktop.setBackgroundColor(bgInput.getValue()) });
    this.addItem(btnSetBg, _window);

    var list1 = new List([new Option('mozna wybrac tylko jedno', '1opcja'), new Option('2 opcja', '2 opcja')], 200, 50);
    this.addItem(list1, _window2);
    var list2 = new List([new Option('mozna wybrac kilka', '1'), new Option('mozna wybrac kilka xD', '2')], 200, 100, true);
    this.addItem(list2, _window2);
    _window.open();
    _window2.open();
}

app2 = new Application('test');

app2.main = function () {
    var data = this;
    var _window = new Window('app2 win1');
    var _window2 = new Window('app2 win2');
    _window.setMainWindow();
    this.addWindow(_window);
    this.addWindow(_window2);
    var button2 = new Button('co wybralem w drugim', 100, 300, function () { data.messageBox(list1.getSelected().text) });
    this.addItem(button2, _window);
    var button3 = new Button('wylacz', 100, 350, function () { data.close(); });
    this.addItem(button3, _window);
    var button4 = new Button('zamknij te okno', 100, 300, function () { _window2.close(); });
    this.addItem(button4, _window2);
    var list1 = new List([new Option('mozna wybrac tylko jedno', '1'), new Option('co innego', '2')], 200, 50);
    this.addItem(list1, _window2);
    var list2 = new List([new Option('fsdfsdf', '1'), new Option('aaaaaaaaaaaa', '2')], 200, 100, true);
    this.addItem(list2, _window2);
    _window.open();

}

explorer = new Application('Explorer');

explorer.main = function () {
    var data = this;

    var desktop = System.desktop;
    var run = new Window('Run', 400, 160);
    run.height = 150;
    run.width = 400;
    run.setMainWindow();
    this.addWindow(run);
    var input = new Input('text', 20, 15, 'app-name', '', { lolsdsd: 'xd' });
    this.addItem(input, run);
    var runButton = new Button('Run', 210, 15, function () { data.ApplicationManager.run(data.ApplicationManager.getApplicationByName(input.getValue())); });
    this.addItem(runButton, run);

    var runListButton = new Button('Run', 210, 50, function () { data.ApplicationManager.run(data.ApplicationManager.getApplicationByName(appList.getSelected().value)); });
    this.addItem(runListButton, run);

    var arrAppList = [];
    for (var i = 0; i < System.Applications.length; i++) {
        arrAppList.push(new Option(System.Applications[i].name, System.Applications[i].name));
    }
    var appList = new List(arrAppList, 20, 50);
    this.addItem(appList, run);
    run.open();
}

login = new Application('Login');


login.main = function () {
    var selfApp = this;
    var login_window = new Window('Login', 400, 180);

    login_window.setMainWindow();
    this.addWindow(login_window);
    login_window.designer = function () {
        var self = this;
        this.username = new Input('text', 90, 15);        
        this.password = new Input('password', 90, 50);
        this.usernameLbl = new Label('Username', 15, 20);
        this.passwordLbl = new Label('Password', 15, 55);
        this.loginBtn = new Button('Log in', 15, 90, function () {
            selfApp.UserManager.login(self.username.getValue(), self.password.getValue(), function (r) {
                if (bool(r)) {
                    selfApp.close();
                    System.desktop.app.messageBox('Logged in successfully', 'tick');
                }
                else {
                    System.desktop.app.messageBox('Couldn\'t log in with the specified data', 'error');
                }
            });
        });

        this.registerBtn = new Button('Don\'t have an account?', 75, 90, function () {
            register_window.open();
        });

        this.addItem(this.username);   
        this.addItem(this.password);
        this.addItem(this.usernameLbl)
        this.addItem(this.passwordLbl);
        this.addItem(this.loginBtn);
        this.addItem(this.registerBtn);
    }

    var register_window = new Window('Register', 400, 200);
    this.addWindow(register_window);
    register_window.designer = function () {
        var self = this;
        this.username = new Input('text', 135, 15);      
        this.password = new Input('password', 135, 50);
        this.passwordConfirm = new Input('password', 135, 85);
        this.usernameLbl = new Label('Username', 15, 20);
        this.passwordLbl = new Label('Password', 15, 55);
        this.passwordConfirmLbl = new Label('Confirm Password', 15, 90);
        this.registerBtn = new Button('Sign up', 15, 130, function () {
            selfApp.UserManager.register(self.username.getValue(), self.password.getValue(), self.passwordConfirm.getValue(), function (r) {
                if (bool(r.success)) {
                    self.close();
                    login_window.setFocus();
                    System.desktop.app.messageBox('Registered successfully', 'tick');
                }
                else {
                    var text = '';
                    for (var key in r) {
                        if (key != 'success') text += '<div>' + r[key] + '</div>';
                    }
                    System.desktop.app.messageBox('Some errors occured:' + text, 'error');
                }
            });
        });
        this.addItem(this.username);
        this.addItem(this.password);
        this.addItem(this.passwordConfirm);
        this.addItem(this.usernameLbl);
        this.addItem(this.passwordLbl);
        this.addItem(this.passwordConfirmLbl);
        this.addItem(this.registerBtn);
    }

    login_window.open();
}

Process = function (id, app) {
    this.id = id;
    this.app = app;
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
            var index = this.process_ids.indexOf(process_id);
            this.process_ids.splice(index, 1);
            break;
        }
    }
}

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
    });;
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

System.ApplicationManager.run = function (app) {
    if (app) {
        var id = System.ProcessManager.getFreeId();
        var process = new Process(id, app);
        System.Processes.push(process);
        app.process_id = id;
        app.main();
    }
    else {
        System.desktop.app.messageBox('Couldn\'t run that app', 'error', 'Error');
    }
}

window.onerror = function (error, url, line) {
    System.desktop.app.messageBox(error, 'error', 'Error');
};

//console.error = function (error) { System.desktop.app.messageBox(error, 'error', 'Error'); };

window.onload = function () {
    System.Init();
}