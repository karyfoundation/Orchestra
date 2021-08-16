
//
// Copyright © 2016-present Pouya Kary. All Rights Reserved
//   Author: Pouya Kary <k@karyfoundation.org>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

//
// ─── MENU ───────────────────────────────────────────────────────────────────────
//

    var MainMenu = [

        //
        // ─── FILE ────────────────────────────────────────────────────────
        //

            {
                label: 'File',
                submenu: [
                    {
                        label: 'New File',
                        accelerator: 'CmdOrCtrl+N',
                        click: onNewFile
                    },
                    {
                        label: 'New Window',
                        accelerator: 'Shift+CmdOrCtrl+N',
                        click: openNewWindow
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Open...',
                        accelerator: 'CmdOrCtrl+O',
                        click: onOpenFile
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Save',
                        accelerator: 'CmdOrCtrl+S',
                        click: ( ) => onSaveFile( )
                    },
                    {
                        label: 'Save As',
                        accelerator: 'Shift+CmdOrCtrl+S',
                        click: onSaveFileAs
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Export to SVG',
                        accelerator: 'CmdOrCtrl+E',
                        click: onExportWorkspaceToSVG
                    },
                ]
            },

        //
        // ─── EDIT MENU ───────────────────────────────────────────────────
        //

            {
                label: 'Edit',
                submenu: [
                    {
                        label: 'Undo',
                        accelerator: 'CmdOrCtrl+Z',
                        role: 'undo'
                    },
                    /*
                    {
                        label: 'Redo',
                        accelerator: 'Shift+CmdOrCtrl+Z',
                        role: 'redo'
                    },*/
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Cut',
                        accelerator: 'CmdOrCtrl+X',
                        role: 'cut'
                    },
                    {
                        label: 'Copy',
                        accelerator: 'CmdOrCtrl+C',
                        role: 'copy'
                    },
                    {
                        label: 'Copy Compiled RegExp',
                        accelerator: 'Shift+CmdOrCtrl+C',
                        click: onCopyRegExp
                    },
                    {
                        label: 'Paste',
                        accelerator: 'CmdOrCtrl+V',
                        role: 'paste'
                    },
                    {
                        label: 'Select All',
                        accelerator: 'CmdOrCtrl+A',
                        role: 'selectall'
                    }
                ]
            },

        //
        // ─── VIEW MENU ───────────────────────────────────────────────────
        //

            {
                label: 'View',
                submenu: [
                    {
                        label: 'Night Mode',
                        accelerator: 'Shift+CmdOrCtrl+N',
                        click: changeColorMode,
                        type: 'checkbox'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Editor',
                        accelerator: 'CmdOrCtrl+E',
                        click: onChangeWindowToEditor,
                        type: 'radio'
                    },
                    {
                        label: 'Playground',
                        accelerator: 'CmdOrCtrl+P',
                        click: onChangeWindowToPlayground,
                        type: 'radio'
                    }
                ]
            },

        //
        // ─── WINDOW MENU ────────────────────────────────────────────────────────────────
        //

            {
                label: 'Window',
                role: 'window',
                submenu: [
                    {
                        role: 'minimize'
                    },
                    {
                        label: 'Maximize',
                        accelerator: 'Shift+CmdOrCtrl+M',
                        click: fireWindowJustMaximizeMinimizeRequest
                    },
                    {
                        role: 'togglefullscreen',
                        click: fireWindowFullScreenRequest
                    },
                    {
                        label: 'Lock Position and Size',
                        accelerator: 'Shift+CmdOrCtrl+L',
                        type: 'checkbox',
                        click: onLockScreenPosition
                    },
                    {
                        role: 'close'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: "Open Developer Tools",
                        accelerator: "Shift+CmdOrCtrl+D",
                        click: ( ) => openDeveloperToolsWindow( )
                    }
                ]
            },

        //
        // ─── HELP MENU ──────────────────────────────────────────────────────────────────
        //

            {
                label: 'Help',
                role: 'help',
                submenu: [
                    {
                        label: "Orchestra Blocks Reference (Offline)",
                        click: onOpenHelpPage
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: "RegExp on ECMA-262 Edition 6.0 (June 2015)",
                        click: ( ) => openExternal('http://www.ecma-international.org/ecma-262/6.0/#sec-regexp-regular-expression-objects')
                    },
                    {
                        label: "RegExp on MDN Web Docs",
                        click: ( ) => openExternal('https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/RegExp')
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: "Pouya Kary's Website",
                        click: ( ) => openExternal('https://kary.us/')
                    },
                    {
                        label: "Report an issue...",
                        click: ( ) => openExternal('https://github.com/pmkary/orchestra/issues')
                    },
                    {
                        label: "Orchestra on GitHub",
                        click: ( ) => openExternal('https://github.com/pmkary/orchestra')
                    },
                ]
            },

        // ────────────────────────────────────────────────────────────────────────────────

    ]

//
// ─── OS SPECIFIC MENUS ──────────────────────────────────────────────────────────
//

    var AboutPageButton = {
        label: 'About Orchestra',
        click: openAboutPage
    }

    if ( process.platform == 'darwin' ) {
        var name = require( 'electron' ).remote.app.getName( )
        var menuIndex = MainMenu.length - 1
        MainMenu.unshift(
            {
                label: name,
                submenu: [
                    AboutPageButton,
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Services',
                        role: 'services',
                        submenu: [ ]
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Hide ' + name,
                        accelerator: 'Command+H',
                        role: 'hide'
                    },
                    {
                        label: 'Hide Others',
                        accelerator: 'Command+Alt+H',
                        role: 'hideothers'
                    },
                    {
                        label: 'Show All',
                        role: 'unhide'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Quit',
                        accelerator: 'Command+Q',
                        click: fireAppQuitRequest
                    },
                ]
            }
        )
    } else {
        MainMenu[ menuIndex ].submenu.push( AboutPageButton )
    }

//
// ─── INIT MENU ──────────────────────────────────────────────────────────────────
//

    function initMainMenu ( ) {
        const remote = electron.remote
        const Menu = remote.Menu
        const MenuItem = remote.MenuItem

        OrchestraAppMenu = Menu.buildFromTemplate( MainMenu )
        Menu.setApplicationMenu( OrchestraAppMenu )
    }

//
// ─── ON MENU DISABLE ────────────────────────────────────────────────────────────
//

    function setMenuEnableFactor ( control ) {
        for ( let menuIndex = 0; menuIndex < OrchestraAppMenu.items.length; menuIndex++ ) {
            let submenu = OrchestraAppMenu.items[ menuIndex ]
                                          .submenu
                                          .items
            for ( let submenuIndex = 0; submenuIndex < submenu.length; submenuIndex++ )
                submenu[ submenuIndex ].enabled = control
        }
    }

//
// ─── GET VIEW MENU ITEMS ────────────────────────────────────────────────────────
//

    function getViewMenuItems ( ) {
        return OrchestraAppMenu.items[ OrchestraAppMenu.items.length - 3 ]
    }

//
// ─── SET COLOR MODE ACTIVATION ──────────────────────────────────────────────────
//

    function setViewColorModeMenuActivation ( state ) {
        getViewMenuItems( ).submenu.items[ 0 ]
                           .checked = state
    }

//
// ─── SET ACTIVE TAB ─────────────────────────────────────────────────────────────
//

    function setActiveTabInMenu ( ) {
        let index = ( CurrentActiveView === 'editor' )? 2 : 3
        getViewMenuItems( ).submenu.items[ index ]
                           .checked = true
    }

//
// ─── MENU LOCK BUTTON ───────────────────────────────────────────────────────────
//

    function getMenuForScreenLock ( ) {
        return OrchestraAppMenu.items[ OrchestraAppMenu.items.length - 2 ]
                               .submenu.items[ 3 ]
    }

// ────────────────────────────────────────────────────────────────────────────────
