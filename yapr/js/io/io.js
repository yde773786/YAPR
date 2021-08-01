const {ipcRenderer} = require('electron');
const swap = require('../Manipulation/swap.js');
const utils = require('../Utils/miscellaneous.js');
const settings = require('../Utils/settings.js');
const consoles = require('../Utils/console.js');
const interpreter = require('../Utils/interpreter.js')
const menu = require('../Utils/menu.js');
var proceed;
var contextTarget;


/** ***********************************************************************
                                CONSOLE
    ***********************************************************************
*/

/*Save settings and pass it on to main for persistence.
Open console after that.*/
ipcRenderer.on('console', () => {
    if(!utils.misc.isConsole){
        swap.consoleLayout();
        consoles.newInputSlot();
        utils.misc.isConsole = true;
    }
});

/*Provide a context menu for a current active textarea to 'pause'/'resume' it's
execution. */
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if(e.target == consoles.consoleData.curr){
        ipcRenderer.send("Menu", true);
    }
    else if(e.target.classList.contains('paused')){
        ipcRenderer.send("Menu", false);
    }

    contextTarget = e.target;
});

/*receive selection of pause/resume */
ipcRenderer.on('menu-click', () => {
    if(contextTarget == consoles.consoleData.curr){
        menu.pauseListener();
    }
    else if(contextTarget.classList.contains('paused')){
        menu.resumeListener(contextTarget);
    }
});

/*Enter key persists input as well as creates a
new textarea for new input. Extra newlines must
be trimmed accordingly.*/
document.addEventListener('keyup', (e) => {

    if (e.target === consoles.consoleData.curr) {
        if(e.key == 'Enter'){
            consoles.enterPressedListener(proceed);
        }
        else {
            consoles.otherPressedListener();
        }
    }
});

/*Deals with up/down arrow keys and providing
the required input from history log. Also overrides
tab default action for indentation.*/
document.addEventListener('keydown', (e) => {

    if (e.target === consoles.consoleData.curr) {

        if(e.key == "ArrowUp" || e.key == "ArrowDown"){
            let currLine = consoles.consoleData.curr.value.substr(0, consoles.consoleData.curr.selectionStart)
                            .split('\n').length;

            /*Override Default action only if Up/Down key is not pressed in middle
            of input block*/
            if((currLine == 1 && e.key == "ArrowUp") || (currLine ==
                consoles.consoleData.curr.value.split('\n').length && e.key == "ArrowDown")){
                    e.preventDefault();
                    consoles.arrowPressedListener(e.key == "ArrowUp");
            }
        }

        if(e.key == 'Tab'){
            e.preventDefault();
            consoles.tabPressedListener();
        }

        if(e.key == 'Enter'){
            e.preventDefault();
        }
    }
});

/** ***********************************************************************
                                PROCESSES
    ***********************************************************************
*/

/*Check if interpreter input is valid. If so, proceed.
Else, give a warning to enter valid interpreter.*/
ipcRenderer.on('interpreter', (_, data) =>{
    let piStr = '';

    if(data.pi.toLowerCase().includes("python")){
        piStr = data.pi;
    }
    else{
        piStr = "No Valid Interpreter Selected";
    }
    consoles.consoleData.infoBox = {text: piStr};

    /*settingsSaved and hs are either both undefined or both containing value*/
    if(typeof(data.hs) != 'undefined'){
        consoles.consoleData.historyInput = data.hs;
        Object.assign(settings.settingsData, data.settingsSaved);

        //Since DOM content will almost certainly be loaded before the Interpreter
        //signal, this can be done.
        swap.consoleLayout();
        consoles.newInputSlot();
    }

    proceed = interpreter.changeInterpreter(piStr, data.pt);

    if(utils.misc.isConsole){
        document.getElementById('interpreter-info').innerHTML = piStr;
    }
});

/*Clears the console.*/
ipcRenderer.on('clear', () => {
    let table = document.getElementById('interior');
    while(table.rows.length > 0) {
        table.deleteRow(0);
    }

    consoles.consoleData.slot = [];
    utils.misc.cnt = 0;
    consoles.newInputSlot();
});

/** ***********************************************************************
                                SETTINGS
    ***********************************************************************
*/

/*Open settings*/
ipcRenderer.on('settings', () => {
    if(utils.misc.isConsole){
        consoles.consoleData.pointer = 0;
        swap.settingsLayout();
        utils.misc.cnt = 0;
        utils.misc.isConsole = false;
    }
});

/*Calls the Listener for the respective settings element when a value has
changed. Also update the settings data after the required action is complete.*/
document.addEventListener('change', (e) => {

    switch (e.target.id) {
        case 'history-limit':
            settings.historyLimitListener();
            break;
        case 'theme-switch':
            settings.themeSwitchListener();
            break;
        case 'err-switch':
            settings.errorSwitchListener();
            break;
        case 'text-font':
            settings.textFontListener();
            break;
    }

    ipcRenderer.send('console-save', settings.settingsData);
});
