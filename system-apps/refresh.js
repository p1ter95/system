/*==============================================================
DESKTOP REFRESH
===============================================================*/

var desktopRefresh = new Service('Desktop Refresh', System.Settings.desktop.refreshRate);

desktopRefresh.main = function() {
	Object.defineProperty(System.Settings.desktop, 'refreshRate', {
		get: function() {
			return desktopRefresh.frequency; 
		},
	  	set: function(newValue) {
	        var process = System.ProcessManager.getProcessByServiceName(desktopRefresh.name);
	        if(process !== undefined) {
	            process.service.frequency = newValue;
	        }
	    }
	});
}

desktopRefresh.loop = function() {
	System.desktop.e.height(System.desktop.window.height());
    System.desktop.time.e[0].innerHTML = System.desktop.getCurrentTime(System.Settings.desktop.taskbarTimeFormat);
    System.desktop.time.setTooltip(System.desktop.getCurrentDate(System.Settings.desktop.taskbarDateFormat));
    switch(System.Settings.desktop.taskbarPosition) {
        case 'top': 
            System.desktop.taskbar.e[0].style.top = 0; 
            System.desktop.taskbar.e[0].style.bottom = 'auto';
            System.desktop.field.e[0].style.top = System.desktop.taskbar.getHeight() + 'px';
            break;
        case 'bottom': 
            System.desktop.taskbar.e[0].style.bottom = 0; 
            System.desktop.taskbar.e[0].style.top = 'auto';
            System.desktop.field.e[0].style.top = 0;
            break;
        default: 
            System.desktop.taskbar.e[0].style.bottom = 0; 
            System.desktop.taskbar.e[0].style.top = 'auto';
            System.desktop.field.e[0].style.top = 0;
    }   
    System.desktop.taskbar.e[0].style.backgroundColor = System.Settings.desktop.taskbarBackground.toRGBAString();
    var taskbarApps = System.desktop.taskbar.e[0].getElementsByClassName('taskbar-app');
    for(var i = 0; i < taskbarApps.length; i++) {
        taskbarApps[i].style.width = System.Settings.desktop.taskbarItemWidth +'px';
    }
    System.desktop.field.setHeight(System.desktop.window.height() - System.desktop.taskbar.getHeight());
    if (System.Settings.desktop.backgroundPath !== '') { //FIX
        System.desktop.e[0].style.backgroundImage = "url('" + System.API.fileSystem.file.get(System.Settings.desktop.backgroundPath) + "')";
        System.desktop.e[0].style.backgroundSize = 'cover';
        System.desktop.e[0].style.backgroundRepeat = 'no-repeat';
        System.desktop.e[0].style.backgroundPosition = 'right'; //FIX
    }
}

/*==============================================================
WINDOWS REFRESH
===============================================================*/

System.ServicesManager.load(desktopRefresh);

var windowsRefresh = new Service('Windows Refresh', System.Settings.applications.refreshRate);

windowsRefresh.main = function() {
	Object.defineProperty(System.Settings.applications, 'refreshRate', {
		get: function() {
			return windowsRefresh.frequency;
		},
	  	set: function(newValue) {
	        var process = System.ProcessManager.getProcessByServiceName(windowsRefresh.name);
	        if(process !== undefined) {
	            process.service.frequency = newValue;
	        }
	    }
	});
}

windowsRefresh.loop = function() {
	for (var i = 0; i < System.WindowManager.windows.length; i++) {
        var _window = System.WindowManager.windows[i];
        if(_window.visible) {
            if (_window.maximized && _window.getPosition().x === 0 && _window.getPosition().y === System.desktop.field.getPositionY()) _window.e[0].getElementsByClassName('window-action-maximize')[0].style.backgroundImage = 'url("res/maximize2.png")';
            else
                _window.e[0].getElementsByClassName('window-action-maximize')[0].style.backgroundImage = 'url("res/maximize.png")';
            if(!_window.allowMinimizing) _window.e[0].getElementsByClassName('window-action-minimize')[0].style.opacity = 0.5;
            if(!_window.allowMaximizing) _window.e[0].getElementsByClassName('window-action-maximize')[0].style.opacity = 0.5;
            if(!_window.allowClosing) _window.e[0].getElementsByClassName('window-action-close')[0].style.opacity = 0.5;
        }
	}
}

System.ServicesManager.load(windowsRefresh);