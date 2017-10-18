System.Lang = {
    name: 'Polish',
    localName: 'Polski',
    code: 'pl',
    daysOfWeek: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
    settings: {
        sourceAlreadyAdded: '{0} jest już dodane do źródeł',
        sourceAdded: '{0} zostało dodane do źródeł',
        sourceError: 'Wystapił błąd podczas dodawania źródła',
        sourceUnloaded: '{0} zostało usunięte',
        sourceRemoved: '{0} zostało usunięte ze źródeł'
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
            renameItemDialog: 'Wprowadź nową nazwę dla tego elementu',
            newItemDialog: 'Wprowadź nazwę dla tego elementu',
            addToSourcesDialog: 'Ile aplikacji i/lub usług znajduję się w tym elemencie?',
            itemDeletionConfirmation: 'Na pewno chcesz usunąć ten element(y)?',
            openWithInfo: 'Wybierz aplikację, za pomocą której chcesz otworzyć ten plik',
            openWithAssociateExtensionWithFile: 'Zawsze używaj tej aplikacji do otwierania tego typu plików',
            tileView: 'Kafelki',
            listView: 'Lista',
            fileName: 'Nazwa',
            fileSize: 'Rozmiar',
            fileModDate: 'Data modyfikacji',
            itemsCountOne: '{0} element',
            itemsCount: 'Elementów: {0}',
            itemsSelected: 'Wybranych elementów: {0}'
        }
    },
    fileSystem: {
        copyOf: 'Kopia ',
        bytes: 'bajty',
        directory: 'Katalog',
        newDirectory: 'Nowy katalog',
        textFile: 'Plik tekstowy',
        newTextFile: 'Nowy plik tekstowy'
    },
    desktop: {
        dialogs: {
            messagebox: 'Wiadomość',
            prompt: 'Podaj dane',
            error: 'Błąd',
            okBtn: 'OK',
            yesBtn: 'Tak',
            noBtn: 'Nie',
            openFile: 'Otwieranie pliku',
            saveFile: 'Zapisywanie pliku',
            openBtn: 'Otwórz',
            saveBtn: 'Zapisz',
            cancelBtn: 'Anuluj',
            browseDir: 'Wybierz folder',
            allFiles: 'Wszystkie pliki'
        },
        messages: {
            error: '{error} w {url} w linii {line}',
            runAppError: 'Nie udało się uruchomić tej aplikacji',
            runServiceError: 'Nie udało się uruchomić tej usługi',
            notLogged: 'Nie jesteś zalogowany/a',
            notFound: '{0} nie zostało odnalezione'
        },
        taskbar: {
            applications: 'Aplikacje',
            places: 'Miejsca',
            system: 'System'
        },
        contextmenu: {
            add: 'Dodaj...',
            closeWindow: 'Zamknij okno',
            homeDirectory: 'Katalog domowy',
            logout: 'Wyloguj się',
            open: 'Otwórz',
            openNewWindow: 'Otwórz w nowym oknie',
            new: 'Nowy',
            openWithBrowser: 'Otwórz za pomocą przeglądarki',
            openWith: 'Otwórz za pomocą...',
            download: 'Pobierz',
            rename: 'Zmień nazwę',
            duplicate: 'Duplikuj',
            delete: 'Usuń',
            setAsWallpaper: 'Ustaw jako tło pulpitu',
            addToSources: 'Dodaj do źródeł',
            run: 'Uruchom'
        }
    }
}

System.SettingsManager.loadLocale();