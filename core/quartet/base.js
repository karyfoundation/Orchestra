
//
// Copyright 2016 Kary Foundation, Inc.
//   Author: Pouya Kary <k@karyfoundation.org>
//

//
// ─── INIT WINDOW ────────────────────────────────────────────────────────────────
//

    function initWindow ( ) {
        setUpWorkspace( );
        setupComposer( );
        setupEventListeners( );
        applyAdditionalStyles( );
        initMainMenu( );
    }

//
// ─── SETUP WORKSPACE ────────────────────────────────────────────────────────────
//

    function setUpWorkspace ( ) {
        var xml = '<xml><block type="compose" deletable="false"></block></xml>';
        var toolbox = document.getElementById( 'toolbox' );

        workspace = Blockly.inject( 'quartet-coding-view', {
            collapse: true,
            toolbox: toolbox,
            border: false,
            scrollbars: true,
        });

        Blockly.Xml.domToWorkspace( Blockly.Xml.textToDom( xml ), workspace );

        ComposeBlock = workspace.getAllBlocks( )[ 0 ];
    }

//
// ─── SETUP COMPOSER ─────────────────────────────────────────────────────────────
//

    function setupComposer ( ) {
        var composer = Blockly.getMainWorkspace().getTopBlocks( )[ 0 ];
        composer.moveBy( 40, 40 );
        //composer.movable_ = false;
    }

//
// ─── SETUP EVENT LISTENERS ──────────────────────────────────────────────────────
//

    function setupEventListeners ( ) {
        workspace.addChangeListener( quartetOnUIChange );
    }

// ────────────────────────────────────────────────────────────────────────────────