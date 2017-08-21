var lang = {
    name: 'Polish',
    localName: 'Polski',
    settings: {
        sourceAlreadyAdded: '{fileName} jest już dodane do źródeł',
        sourceAdded: '{fileName} zostało dodane do źródeł',
        sourceError: 'Wystapił błąd podczas dodawania źródła',
        sourceUnloaded: '{fileName} zostało usunięte',
        sourceRemoved: '{fileName} zostało usunięte ze źródeł'
    },
    loginApp: {
        loginCaption: 'Logowanie',
        loginUsername: 'Nazwa użytkownika',
        loginPassword: 'Hasło',
        loginBtn: 'Zaloguj',
        loginSuccess: 'Zalogowano pomyślnie',
        loginFail: 'Logowanie nieudane',
        registerPopup: 'Nie masz konta?',
        registerCaption: 'Rejestracja',
        registerUsername: 'Nazwa użytkownika',
        registerPassword: 'Hasło',
        registerConfirmPassword: 'Potwierdź hasło',
        registerBtn: 'Zarejestruj się',
        registerSuccess: 'Zarejestrowano pomyślnie',
        registerFail: 'Wystąpiły błędy podczas rejestracji:'
    },
    explorer: {
        uploadApp: {
            caption: 'Wysyłanie',
            diskMethod: 'Wyślij z dysku',
            urlMethod: 'Wyślij z URL',
            destination: 'Ścieżka docelowa',
            browse: 'Przeglądaj...',
            url: 'URL',
            overwrite: 'Nadpisz',
            uploadBtn: 'Wyślij',
            success: 'Plik wysłano pomyślnie',
            fail: 'Wystąpił błąd podczas wysyłania pliku'
        },
        runApp: {
            caption: 'Uruchom',
            runBtn: 'Uruchom',
            runListBtn: 'Uruchom'
        },
        fileExplorer: {
            caption: 'Eksplorator plików',
			go: 'Idź',
			upOneLevel: 'W górę',
            view: 'Widok',
            renameFile: 'Wprowadź nową nazwę dla tego pliku',
            tileView: 'Kafelki',
            listView: 'Lista',
            fileName: 'Nazwa',
            fileSize: 'Rozmiar',
            fileModDate: 'Data modyfikacji',
        }
    },
    fileSystem: {
        copyOf: 'Kopia ',
        bytes: 'bajty'
    },
    desktop: {
        dialogs: {
            messagebox: 'Wiadomość',
            prompt: 'Podaj dane',
            error: 'Błąd',
            okBtn: 'OK',
            openFile: 'Otwieranie pliku',
            saveFile: 'Zapisywanie pliku',
            openBtn: 'Otwórz',
            saveBtn: 'Zapisz',
            cancelBtn: 'Anuluj',
            browseDir: 'Wybierz folder',
            allFiles: 'All files'
        },
        messages: {
            error: '{error} w {url} w linii {line}',
            runAppError: 'Nie można uruchomić tej aplikacji',
            runServiceError: 'Nie można uruchomić tej usługi',
            notLogged: 'Nie jesteś zalogowany/a',
            notFound: '{what} nie zostało odnalezione'
        },
        taskbar: {
            applications: 'Aplikacje',
            places: 'Miejsca',
            system: 'System'
        },
        contextmenu: {
            closeWindow: 'Zamknij okno',
            homeDirectory: 'Katalog domowy',
            logout: 'Wyloguj się',
            open: 'Otwórz',
            openNewWindow: 'Otwórz w nowym oknie',
            openWithBrowser: 'Otwórz za pomocą przeglądarki',
            download: 'Pobierz',
            rename: 'Zmień nazwę',
            duplicate: 'Duplikuj',
            delete: 'Usuń',
            setAsWallpaper: 'Ustaw jako tło pulpitu',
            run: 'Uruchom'
        }
    }
}

System.LocalizationManager.load(lang);