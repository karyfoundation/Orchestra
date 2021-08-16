
//
// Copyright © 2016-present Pouya Kary. All Rights Reserved
//   Author: Pouya Kary <k@karyfoundation.org>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

//
// ─── DEFS ───────────────────────────────────────────────────────────────────────
//

    const electron                          = require( 'electron' )
    const { ipcMain, BrowserWindow, app }   = electron
    const { contextBridge, dialog }         = electron
    const messenger                         = require( 'messenger' )
    const fs                                = require( 'fs' )
    const path                              = require( 'path' )

//
// ─── CONSTANTS ──────────────────────────────────────────────────────────────────
//

    const uniqueWindowIdKey     = 'orchestra-unique-window-id'
    const settingsFilePath      = path.join( __dirname, 'orchestraSettings.json' )
    const orchestraVersion      = '1.0'
    const quartetVersion        = '1.2'

    const webPreferences = {
        nodeIntegration:        true,
        contextIsolation:       false,
        enableRemoteModule:     true,
        preload:                path.join( __dirname, "preload.js" )
    }

//
// ─── STORAGE ────────────────────────────────────────────────────────────────────
//

    let windows             = new Set( )
    let windowCount         = 0
    let isHelpWindowOpen    = false
    let isAboutWindowOpen   = false
    let isWinServerLoaded   = false
    let helpWindow
    let firstLoadFilePath   = null

    let settings = {
        windowThemeStatus: 'light'
    }

//
// ─── HELPER TOOLS ───────────────────────────────────────────────────────────────
//

    function existsSync ( filename ) {
        try {
            fs.accessSync( filename )
            return true
        } catch ( ex ) {
            return false
        }
    }

//
// ─── IPC BROAD CAST ─────────────────────────────────────────────────────────────
//

    function broadcast ( messageId, data ) {
        for ( let win of windows )
            win.webContents.send( messageId, data )
    }

//
// ─── SAVE SETTINGS ──────────────────────────────────────────────────────────────
//

    function saveSettings ( ) {
        fs.writeFileSync( settingsFilePath, JSON.stringify( settings ) )
    }

//
// ─── UPDATE SETTINGS ────────────────────────────────────────────────────────────
//

    function updateSettings ( newSettings ) {
        Object.assign( settings, newSettings )
        saveSettings( )
    }

//
// ─── GENERATE MAIN WINDOW ───────────────────────────────────────────────────────
//

    function createWindow ( args = { mode: 'start' } ) {
        let editorWindow
        windowCount++

        const window_width = 1100
        const window_height = 640
        editorWindow = new BrowserWindow({
            show: false,
            width:  window_width,   minWidth: window_width - 150,
            height: window_height,  minHeight: window_height - 100,
            //backgroundColor: ( settings.windowThemeStatus === 'dark' )? '1E1E1E' : '#F7F7F7',
            frame: false,
            // fullscreen: false,
            webPreferences
        })

        editorWindow.maximize( )
        editorWindow.setMenuBarVisibility( false )
        //editorWindow.openDevTools( )


        // settings up window options
        let windowOptions = {
            theme: settings.windowThemeStatus,
        }

        if ( args.mode === 'file' )
            windowOptions.file = args.file

        if ( args.mode === 'parse' )
            windowOptions.regexp = args.regexp

        // adding to windows
        windows.add( editorWindow )

        // loading the window
        editorWindow.loadURL( `file://${ __dirname }/index.html?${
            encodeURI( JSON.stringify( windowOptions ) )
        }`)

        editorWindow.once( 'ready-to-show', ( ) => {
            editorWindow.show( )
            editorWindow.focus( )
        })

        // editorWindow.openDevTools( )

        editorWindow.on( 'closed' , ( ) => {
            windows.delete( editorWindow )
            windowCount--
        })
    }

//
// ─── OPEN HELP WINDOW ───────────────────────────────────────────────────────────
//

    function openHelpWindow ( arg = '' ) {
        if ( isHelpWindowOpen ) return
        isHelpWindowOpen = true

        helpWindow = new BrowserWindow({
            title: "Orchestra Blocks Reference",
            width:  1050, minWidth: 1050,
            height: 600, minHeight: 200,
            backgroundColor: 'white',
            fullscreen: false,
            webPreferences
        })

        // helpWindow.openDevTools( )

        // adding to windows
        windows.add( helpWindow )


        if ( arg === '' )
            helpWindow.loadURL( `file://${ __dirname }/help/index.html?none` )
        else
            helpWindow.loadURL( `file://${ __dirname }/help/index.html?ref-${ arg }` )

        helpWindow.on( 'closed' , ( ) => {
            isHelpWindowOpen = false
            windows.delete( helpWindow )
            helpWindow = null
        })
    }

//
// ─── OPEN ABOUT PAGE ────────────────────────────────────────────────────────────
//

    function openAboutWindow ( parent ) {
        if ( isAboutWindowOpen ) return
        isAboutWindowOpen = true

        console.log( parent )

        const aboutWindowHeight =
            415
        const aboutWindowWidth =
            650

        let aboutWindow = new BrowserWindow({
            title: 'Orchestra Hall',
            titleBarStyle: 'hiddenInset',
            width: aboutWindowWidth,
            minWidth: aboutWindowWidth,
            maxWidth: aboutWindowWidth,
            height: aboutWindowHeight,
            minHeight: aboutWindowHeight,
            maxHeight: aboutWindowHeight,
            //backgroundColor: ( settings.windowThemeStatus === 'dark' )? 'black' : '#ECECEC',
            minimizable: false,
            maximizable: false,
            resizable: false,
            fullscreen: false,
            parent: parent,
            modal: true,
            show: false,
            webPreferences
        })

        aboutWindow.loadURL( `file://${ __dirname }/about/index.html?${
            encodeURI( JSON.stringify({
                theme: settings.windowThemeStatus,
                orchestraVersion: orchestraVersion,
                quartetVersion: quartetVersion
            }))}`)

        aboutWindow.once( 'ready-to-show', ( ) => {
            aboutWindow.show( )
        })

        // adding to the windows
        windows.add( aboutWindow )

        aboutWindow.on( 'closed' , ( ) => {
            isAboutWindowOpen = false
            windows.delete( aboutWindow )
            aboutWindow = null
        })
    }

//
// ─── SINGE INSTANCE APP ─────────────────────────────────────────────────────────
//

    app.requestSingleInstanceLock()

//
// ─── LOAD SETTINGS ──────────────────────────────────────────────────────────────
//

    function loadSettings ( ) {
        try {
            Object.assign( settings, JSON.parse( fs.readFileSync( settingsFilePath ) ) )
        } catch ( e ) {
            console.log('Could not found the settings file')
        }
    }

//
// ─── ON OPEN FILE EVENT ─────────────────────────────────────────────────────────
//

    app.on( 'open-file', ( event, filePath ) => {
        event.preventDefault( )

        if ( isWinServerLoaded ) {
            createWindow({
                mode: 'file',
                file: filePath
            })
        } else {
            firstLoadFilePath = filePath
        }
    })

//
// ─── ON READY ───────────────────────────────────────────────────────────────────
//

    app.on( 'ready' , loadWinServer )

    function loadWinServer ( ) {
        if ( isWinServerLoaded ) { return }

        console.log(`Orchestra, Version ${ orchestraVersion }`)
        console.log('Copyright 2016-present - Pouya Kary. All Rights Reserved.')
        isWinServerLoaded = true


        let windowCreationArgs
        if ( firstLoadFilePath ) {
            windowCreationArgs = {
                mode: 'file',
                file: firstLoadFilePath,
            }
            firstLoadFilePath = null
        } else {
            windowCreationArgs =
                parseArgs( process.argv )
        }


        loadSettings( )
        createWindow( windowCreationArgs )
    }

//
// ─── ON OPEN HELP WINDOW ────────────────────────────────────────────────────────
//

    ipcMain.on ( 'open-help-page', ( event, arg ) => openHelpWindow ( ))

//
// ─── OPEN HELP FOR REFERENCE ────────────────────────────────────────────────────
//

    ipcMain.on ( 'open-help-for-ref', ( event, arg ) => {
        if ( isHelpWindowOpen ) {
            helpWindow.focus( )
            helpWindow.webContents.send( 'help-window-open-ref', `ref-${ arg }` )
        } else
            openHelpWindow( arg )
    })

//
// ─── ON WINDOW ASKS ─────────────────────────────────────────────────────────────
//

    ipcMain.on( 'open-new-window', ( event, arg ) => createWindow( ) )

//
// ─── OPEN ABOUT PAGE ────────────────────────────────────────────────────────────
//

    ipcMain.on( 'open-about-page', ( event, arg ) => openAboutWindow( event ) )

//
// ─── THEME CHANGE TOOL ──────────────────────────────────────────────────────────
//

    ipcMain.on( 'theme-change', ( event, mode ) => {
        updateSettings({
            windowThemeStatus: mode
        })
        broadcast( 'change-theme-to', mode )
    })

//
// ─── ON APP QUIT REQUEST ────────────────────────────────────────────────────────
//

    ipcMain.on( 'app-quit', ( event, arg ) => app.quit( ) )

//
// ─── QUIT APP ON WINDOWS CLOSE ──────────────────────────────────────────────────
//

    app.on( 'window-all-closed', ( e, win ) => {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if ( process.platform !== 'darwin' )
            app.quit( )
    })

//
// ─── ON ACTIVE ──────────────────────────────────────────────────────────────────
//

    app.on( 'activate', ( ) => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if ( windowCount === 0 )
            createWindow( )
    })

//
// ─── PARSE ARGS ─────────────────────────────────────────────────────────────────
//

    function parseArgs ( args ) {
        if ( args.length === 2 )
            if ( args[ 1 ].endsWith( '.orchestra' ) )
                return {
                    mode: 'file',
                    file: args[ 1 ]
                }
        if ( args.length === 3 )
            if ( args[ 1 ] === 'parse' )
                return {
                    mode: 'parse',
                    regexp: args[ 2 ]
                }
        return { mode: 'start' }
    }

//
// ─── EXTENSION SERVER ───────────────────────────────────────────────────────────
//

    function runExtensionServer ( ) {

        //
        // ─── CREATE SERVER ───────────────────────────────────────────────
        //

            const extensionServer = messenger.createListener( 5994 )

        //
        // ─── ON OPEN ORCHESTRA FOR A REGEX ───────────────────────────────
        //

            extensionServer.on( 'open', ( message, regX ) => {
                if ( regX !== null || regX !== undefined )
                    if ( existsSync( regX ) )
                        createWindow({ mode: 'parse', regexp: regX })
                    else
                        message.reply( '404' )
                else
                    createWindow( )
            })

        // ─────────────────────────────────────────────────────────────────

    }

// ────────────────────────────────────────────────────────────────────────────────
