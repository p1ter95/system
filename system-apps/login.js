login = new Application('Login');
//login.allowMultipleInstances = true;

login.main = function (args) {
    var selfApp = this;
    var login_window = new Window(System.Lang.loginApp.loginCaption, 400, 180);
	login_window.allowMaximizing = false;   
    this.addWindow(login_window);
	login_window.setMainWindow();
    if(args !== undefined && !args.allowClosing) login_window.allowClosing = false;
    login_window.designer = function () {
        var self = this;
        this.username = new Input('text', 90, 15);
        this.password = new Input('password', 90, 50);
        this.usernameLbl = new Label(System.Lang.loginApp.loginUsername, 15, 20);
        this.passwordLbl = new Label(System.Lang.loginApp.loginPassword, 15, 55);
        this.loginBtn = new Button(System.Lang.loginApp.loginBtn, 15, 90, function () {
            selfApp.user.login(self.username.getValue(), self.password.getValue(), function (r) {
                if (r) {
                    /*selfApp.messageBox(System.Lang.loginApp.loginSuccess, 'tick', undefined, [new Button('OK', undefined, undefined, function() {
                        selfApp.close();
                    })]);*/
                    selfApp.close();
                }
                else {
                    selfApp.messageBox(System.Lang.loginApp.loginFail, 'error');
                }
            });
        });

        this.registerBtn = new Button(System.Lang.loginApp.registerPopup, 75, 90, function () {
            register_window.open();
        });

        this.addItem(this.username);
        this.addItem(this.password);
        this.addItem(this.usernameLbl)
        this.addItem(this.passwordLbl);
        this.addItem(this.loginBtn);
        this.addItem(this.registerBtn);
    }

    login_window.main = function() {
        this.username.setFocus();
    }

    var register_window = new Window(System.Lang.loginApp.registerCaption, 400, 220);
    this.addWindow(register_window);
    register_window.designer = function () {
        var self = this;
        this.username = new Input('text', 135, 15);
        this.password = new Input('password', 135, 50);
        this.passwordConfirm = new Input('password', 135, 85);
        this.usernameLbl = new Label(System.Lang.loginApp.registerUsername, 15, 20);
        this.passwordLbl = new Label(System.Lang.loginApp.registerPassword, 15, 55);
        this.passwordConfirmLbl = new Label(System.Lang.loginApp.registerConfirmPassword, 15, 90);
        this.registerBtn = new Button(System.Lang.loginApp.registerBtn, 15, 130, function () {
            selfApp.user.register(self.username.getValue(), self.password.getValue(), self.passwordConfirm.getValue(), function (r) {
                if (bool(r.success)) {
                    self.close();
                    selfApp.messageBox(System.Lang.loginApp.registerSuccess, 'tick');
                }
                else {
                    selfApp.messageBox(System.Lang.loginApp.registerFail + showMessage(r), 'error');
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
    register_window.main = function() {
        this.username.setFocus();
    }

    login_window.open();
}

System.ApplicationManager.load(login);