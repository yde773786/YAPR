const {ipcRenderer} = require('electron');
const utils = require('../Utils/utils.js');
const indent = require('../Manipulation/indent.js');
const swap = require('../Manipulation/swap.js');
const interpreter = require('./interpreter.js')
var historyInput = [];
var pointer = 0;
var pointToEdit = {'0' : {value: '', space: 1}};
var proceed;
var isConsole = true;

/** ***********************************************************************
                                CONSOLE
    ***********************************************************************
*/

/*Save settings and pass it on to main for persiswdxatence.
Open console after that.*/
ipcRenderer.on('console', () => {
    if(!isConsole){
        swap.consoleLayout();
        swap.newInputSlot();
        isConsole = true;
    }
});

/*Provide a context menu for a current active textarea to 'pause'/'resume' it's
execution. */
window.addEventListener('contextmenu', (e) => {
    let curr = document.getElementsByTagName('TEXTAREA')
                        [document.getElementsByTagName('TEXTAREA').length - 1];

    e.preventDefault();
    if(e.target == curr){
        ipcRenderer.send("Menu", true);
    }
});

/*Enter key persists input as well as creates a
new textarea for new input. Extra newlines must
be trimmed accordingly.*/
document.addEventListener('keyup', (e) => {

    let curr = document.getElementsByTagName('TEXTAREA')
                        [document.getElementsByTagName('TEXTAREA').length - 1];

    if (e.target === curr) {
        if(e.key == 'Enter'){

            if(proceed){
                if(indent.nextLine(curr)){
                    return;
                }

                pointToEdit = {'0' : {value: '', space: 1}};
                pointer = 0;

                evaluation(curr);
            }
            else{
                ipcRenderer.send('cannot-interpret');
                //Replace leading and trailing NEWLINES ONLY.
                curr.rows = 1;
            }
        }
        else {
            curr.rows = curr.value.split('\n').length;
            pointToEdit[pointer] = {value: curr.value, space: curr.rows};
        }
    }
});

/*Deals with up/down arrow keys and providing
the required input from history log. Also overrides
tab default action for indentation.*/
document.addEventListener('keydown', (e) => {

    let curr = document.getElementsByTagName('TEXTAREA')
                        [document.getElementsByTagName('TEXTAREA').length - 1];

    if (e.target === curr) {

        if(e.key == "ArrowUp" || e.key == "ArrowDown"){
            let currLine = curr.value.substr(0, curr.selectionStart).split('\n').length;

            /*Override Default action only if Up/Down key is not pressed in middle
            of input block*/
            if((currLine == 1 && e.key == "ArrowUp") || (currLine ==
                curr.value.split('\n').length && e.key == "ArrowDown")){

                    e.preventDefault(curr);

                    let currDisp = curr.value;
                    let currRows = curr.rows;
                    let temp = pointer;

                    if(e.key == "ArrowUp" && pointer != historyInput.length){
                        pointer++;
                    }
                    else if(e.key == "ArrowDown" && pointer != 0){
                        pointer--;
                    }

                    if(typeof(pointToEdit[pointer]) != 'undefined'){
                        currDisp = pointToEdit[pointer].value;
                        currRows = pointToEdit[pointer].space;
                    }
                    else if(temp != pointer) {
                        currDisp = historyInput[historyInput.length - pointer].value;
                        currRows = historyInput[historyInput.length - pointer].space;
                    }

                    curr.value = currDisp;
                    curr.rows = currRows;

            }
        }

        if(e.key == 'Tab'){
            e.preventDefault();

            let head = curr.value.substring(0, curr.selectionStart);
            let tail = curr.value.substring(curr.selectionEnd);

            curr.value = head + "\t" + tail;
            curr.selectionStart = curr.selectionEnd = head.length + 1;
        }

        if(e.key == 'Enter'){
            e.preventDefault();
        }
    }
});

/** ***********************************************************************
                                INTERPRETER
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
    swap.consoleData.infoBox = {text: piStr};

    /*settingsSaved and hs are either both undefined or both containing value*/
    if(typeof(data.hs) != 'undefined'){
        historyInput = data.hs;
        Object.assign(swap.settingsData, data.settingsSaved);

        //Since DOM content will almost certainly be loaded before the Interpreter
        //signal, this can be done.
        swap.consoleLayout();
        swap.newInputSlot();
    }

    proceed = interpreter.changeInterpreter(piStr, data.pt);

    if(isConsole){
        document.getElementById('interpreter-info').innerHTML = piStr;
    }
});

/*Clears the console.*/
ipcRenderer.on('clear', () => {
    let table = document.getElementById('interior');
    while(table.rows.length > 0) {
        table.deleteRow(0);
    }

    swap.consoleData.input = swap.consoleData.output = [];
    swap.cnt.val = 0;
    swap.newInputSlot();
});

async function evaluation(curr){

    let currStr = (curr.value).split('\n');
    let i;

    //Take in input and deal with it one at a time
    for(i = 0; i < currStr.length - 1; i++){
        // If continuation block, get the last input in curr.
        // Otherwise just the current value in curr.

        //Only concerned with single lined input and handling
        //the stdout associated with it.
         interpreter.writeInput(currStr[i] + '\n');
         await interpreter.executeInput(swap.settingsData.errorDesc);

    }
    interpreter.resetInput();

    //Deals with the final result
    interpreter.writeInput(currStr[i] + '\n');
    outType = await interpreter.executeInput(swap.settingsData.errorDesc);

    if(!outType.isWritten){
        outType.msg = "YAPR error: Newline expected at end of input command.";
        outType.isError = true;

        /*Flush out stdin for custom YAPR error*/
        interpreter.writeInput('dummy\n');
        await interpreter.executeInput(swap.settingsData.errorDesc);
    }

    swap.newOutputSlot({msg: outType.msg, isError: outType.isError});
    swap.consoleData.output.push(outType);

    //Replace leading and trailing NEWLINES ONLY.
    curr.disabled = true;

    newestAddition = {value: curr.value, space: curr.rows};
    swap.consoleData.input.push(newestAddition);

    if(newestAddition.value.trim() != ''){
        ipcRenderer.send('history-update', newestAddition);
        utils.historyUpdate(historyInput, swap.settingsData.historyLimit, newestAddition);
    }

    swap.newInputSlot();
}

/** ***********************************************************************
                                SETTINGS
    ***********************************************************************
*/

/*Open settings*/
ipcRenderer.on('settings', () => {
    if(isConsole){
        pointer = 0;
        swap.settingsLayout();
        swap.cnt.val = 0;
        isConsole = false;
    }
});

/*Calls the Listener for the respective settings element when a value has
changed. Also update the settings data after the required action is complete.*/
document.addEventListener('change', (e) => {

    function textFontListener(){
        swap.settingsData.font = document.getElementById('text-font').value;
        swap.adjustFont();
    }

    function historyLimitListener(){
        swap.settingsData.historyLimit = document.getElementById('history-limit').value;
        utils.historyUpdate(historyInput, swap.settingsData.historyLimit);
        ipcRenderer.send('history-update');
    }

    function themeSwitchListener(){
        swap.settingsData.dark = document.getElementById('theme-switch').checked;
        swap.adjustTheme();
    }

    function errorSwitchListener(){
        swap.settingsData.errorDesc = document.getElementById('err-switch').checked;
    }

    switch (e.target.id) {
        case 'history-limit':
            historyLimitListener();
            break;
        case 'theme-switch':
            themeSwitchListener();
            break;
        case 'err-switch':
            errorSwitchListener();
            break;
        case 'text-font':
            textFontListener();
            break;
    }

    ipcRenderer.send('console-save', swap.settingsData);
});
