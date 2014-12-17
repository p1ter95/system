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
                if (bool(r.success)) {
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
                    System.desktop.app.messageBox('Some errors occured:' + showErrors(r), 'error');
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

System.ApplicationManager.load(login);