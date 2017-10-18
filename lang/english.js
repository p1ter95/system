System.Lang = {
    name: 'English',
    localName: 'English',
    code: 'en-us',
    daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    settings: {
        sourceAlreadyAdded: '{0} is already added to sources',
        sourceAdded: '{0} added to sources',
        sourceError: 'An error occurred with adding the source',
        sourceUnloaded: '{0} unloaded',
        sourceRemoved: '{0} removed from sources'
    },
    loginApp: {
        loginCaption: 'Login',
        loginUsername: 'Username',
        loginPassword: 'Password',
        loginBtn: 'Log in',
        loginSuccess: 'Logged in successfully',
        loginFail: 'Couldn\'t log in with the specified data',
        registerPopup: 'Don\'t have an account?',
        registerCaption: 'Register',
        registerUsername: 'Username',
        registerPassword: 'Password',
        registerConfirmPassword: 'Confirm Password',
        registerBtn: 'Sign up',
        registerSuccess: 'Registered successfully',
        registerFail: 'Some errors occurred:'
    },
    explorer: {
        uploadApp: {
            caption: 'Upload',
            diskMethod: 'Upload from disk',
            urlMethod: 'Upload from URL',
            destination: 'Destination',
            browse: 'Browse...',
            url: 'URL',
            overwrite: 'Overwrite',
            uploadBtn: 'Upload',
            success: 'File uploaded successfully',
            fail: 'An error occurred while trying to upload the file'
        },
        runApp: {
            caption: 'Run',
            runBtn: 'Run',
            runListBtn: 'Run'
        },
        fileExplorer: {
            caption: 'File Explorer',
			go: 'Go',
			upOneLevel: 'Up one level',
            view: 'View',
            renameItemDialog: 'Enter a new name for this item',
            newItemDialog: 'Enter a name for this item',
            addToSourcesDialog: 'How many applications and/or services does this item contain?',
            itemDeletionConfirmation: 'Are you sure you want to delete this item(s)?',
            openWithInfo: 'Choose the application you want to use to open this file',
            openWithAssociateExtensionWithFile: 'Always use this application to open this kind of file',
            tileView: 'Tiles',
            listView: 'List',
            fileName: 'Name',
            fileSize: 'Size',
            fileModDate: 'Modification date',
            itemsCountOne: '{0} item',
            itemsCount: '{0} items',
            itemsSelected: '{0} items selected'
        }
    }, 
    fileSystem: {
        copyOf: 'Copy of ',
        bytes: 'bytes',
        directory: 'Directory',
        newDirectory: 'New directory',
        textFile: 'Text file',
        newTextFile: 'New text file'
    },
    desktop: {
        dialogs: {
            messagebox: 'Message Box',
            prompt: 'Prompt',
            error: 'Error',
            okBtn: 'OK',
            yesBtn: 'Yes',
            noBtn: 'No',
            openFile: 'Opening a file',
            saveFile: 'Saving a file',
            openBtn: 'Open',
            saveBtn: 'Save',
            cancelBtn: 'Cancel',
            browseDir: 'Browse for a directory',
            allFiles: 'All files'
        },
        messages: {
            error: '{error} in {url} at {line}',
            runAppError: 'Couldn\'t run that app',
            runServiceError: 'Couldn\'t run that service',
            notLogged: "You're not logged in",
            notFound: "Couldn't find {0}"
        },
        taskbar: {
            applications: 'Applications',
            places: 'Places',
            system: 'System'
        },
        contextmenu: {
            add: 'Add...',
            closeWindow: 'Close window',
            homeDirectory: 'Home directory',
            logout: 'Logout',
            open: 'Open',
            openNewWindow: 'Open in a new window',
            new: 'New',
            openWithBrowser: 'Open with Browser',
            openWith: 'Open with...',
            download: 'Download',
            rename: 'Rename',
            duplicate: 'Duplicate',
            delete: 'Delete',
            setAsWallpaper: 'Set as wallpaper',
            addToSources: 'Add to sources',
            run: 'Run'
        }
    }
}

System.SettingsManager.loadLocale();