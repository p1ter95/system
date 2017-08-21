var lang = {
    name: 'English',
    localName: 'English',
    settings: {
        sourceAlreadyAdded: '{fileName} is already added to sources',
        sourceAdded: '{fileName} added to sources',
        sourceError: 'An error occurred with adding the source',
        sourceUnloaded: '{fileName} unloaded',
        sourceRemoved: '{fileName} removed from sources'
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
            renameFile: 'Enter a new name for this file',
            tileView: 'Tiles',
            listView: 'List',
            fileName: 'Name',
            fileSize: 'Size',
            fileModDate: 'Modification date',
        }
    }, 
    fileSystem: {
        copyOf: 'Copy of ',
        bytes: 'bytes'
    },
    desktop: {
        dialogs: {
            messagebox: 'Message Box',
            prompt: 'Prompt',
            error: 'Error',
            okBtn: 'OK',
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
            notFound: "Couldn't find {what}"
        },
        taskbar: {
            applications: 'Applications',
            places: 'Places',
            system: 'System'
        },
        contextmenu: {
            closeWindow: 'Close window',
            homeDirectory: 'Home directory',
            logout: 'Logout',
            open: 'Open',
            openNewWindow: 'Open in new window',
            openWithBrowser: 'Open with Browser',
            download: 'Download',
            rename: 'Rename',
            duplicate: 'Duplicate',
            delete: 'Delete',
            setAsWallpaper: 'Set as wallpaper',
            run: 'Run'
        }
    }
}

System.LocalizationManager.load(lang);