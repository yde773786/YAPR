const {ipcRenderer} = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const utils = require('./Utils/utils.js')
const indent = require('./Manipulation/indent.js');
const swap = require('./Manipulation/swap.js');

var historyInput = [];
var pointer = 0;
var pointToEdit = {'0' : {value: '', space: 1}};
var py;
var proceed;
var inside = false;
var totalData = '';
var isConsole = true;
var piStr;

/*Save settings and pass it on to main for persistence.
Open console after that.*/
ipcRenderer.on('console', () => {
    if(!isConsole){
        swap.consoleLayout();
        swap.newInputSlot();
        isConsole = true;
    }
});

/*Open settings*/
ipcRenderer.on('settings', () => {
    if(isConsole){
        pointer = 0;
        swap.settingsLayout();
        swap.cnt.val = 0;
        isConsole = false;
    }
});

/** ***********************************************************************
                                CONSOLE
    ***********************************************************************
*/

/*Enter key persists input as well as creates a
new textarea for new input. Extra newlines must
be trimmed accordingly.*/
document.addEventListener('keyup', (e) => {

    let curr = document.getElementsByTagName('TEXTAREA')
                        [document.getElementsByTagName('TEXTAREA').length - 1];

    if (e.target === curr) {
        if(e.keyCode == 13){

            if(proceed){
                let currStr = (curr.value).split('\n');;

                if(indent.nextLine(curr)){
                    return;
                }

                pointToEdit = {'0' : {value: '', space: 1}};
                let i = 0;
                pointer = 0;

                async function evaluation(){

                    //Take in input and deal with it one at a time
                    for(i = 0; i < currStr.length - 1; i++){
                        // If continuation block, get the last input in curr.
                        // Otherwise just the current value in curr.

                        //Only concerned with single lined input and handling
                        //the stdout associated with it.
                         py.stdin.write(currStr[i] + '\n');
                         await executeInput(currStr[i]);

                    }
                    py.stdout.removeAllListeners(['data']);
                    //Deals with the final result
                    py.stdin.write(currStr[i] + '\n');
                    outType = await executeInput(currStr[i] + '\n');

                    if(!outType.isWritten){
                        outType.msg = "YAPR error: Newline expected at end of input command.";
                        outType.isError = true;

                        /*Flush out stdin for custom YAPR error*/
                        py.stdin.write('dummy\n');
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
                    totalData = '';

                }

                evaluation();
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

        if(e.keyCode == 38 || e.keyCode == 40){
            let currLine = curr.value.substr(0, curr.selectionStart).split('\n').length;

            /*Override Default action only if Up/Down key is not pressed in middle
            of input block*/
            if((currLine == 1 && e.keyCode == 38) || (currLine ==
                curr.value.split('\n').length && e.keyCode == 40)){

                    e.preventDefault();

                    let currDisp = curr.value;
                    let currRows = curr.rows;
                    let temp = pointer;

                    if(e.keyCode == 38 && pointer != historyInput.length){
                        pointer++;
                    }
                    else if(e.keyCode == 40 && pointer != 0){
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

        if(e.keyCode == 9){
            e.preventDefault();

            let head = curr.value.substring(0, curr.selectionStart);
            let tail = curr.value.substring(curr.selectionEnd);

            curr.value = head + "\t" + tail;
            curr.selectionStart = curr.selectionEnd = head.length + 1;
        }

        if(e.keyCode == 13){
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
ipcRenderer.on('interpreter', (event, data) =>{
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

    if(piStr != "No Valid Interpreter Selected"){
        /*Mac & Linux run bash file, windows runs batch file*/
        process.platform === "win32" ?
        py = spawn(path.join(__dirname, 'pystderr.bat'), [data.pt])
        : py = spawn(path.join(__dirname, 'pystderr.sh'), [data.pt]);

        /*Remove unneeded verion information (from stderr)*/
        function dummyPromise() {
            return new Promise(function(resolve) {
                py.stdout.once("data", (data) => {
                    resolve();
                });
            });
        }

        async function dummyAwait(){
            await dummyPromise();
            proceed = true;
        }

        dummyAwait();
    }
    else{
        proceed = false;
    }

    if(isConsole){
        document.getElementById('interpreter-info').innerHTML = piStr;
    }
});

/*Clears the console.*/
ipcRenderer.on('clear', (e) => {
    let table = document.getElementById('interior');
    while(table.rows.length > 0) {
        table.deleteRow(0);
    }

    swap.cnt.val = 0;
    swap.newInputSlot();
});

function executeInput() {

    /*Delay the normal execution of a key press of
    Enter key so that the execution of child process
    can occur.*/
    return new Promise((resolve) => {
        inside = false;

        py.stdout.once("data", (data) => {

            let tempData = totalData;
            data = data.toString();
            tempData += data;

            /*Recognize extraneous '>>>' or '...' (from stderr) */
            function customLastIndexOf(mainStr, subStr){
                temp = mainStr.trim();
                return temp.substring(temp.length - 3) == subStr ?
                temp.length - 3 : -1;
            }

            licont = customLastIndexOf(tempData, '...');
            liarr = customLastIndexOf(tempData, '>>>');

            if(!(licont == -1 && liarr == -1)){

                let isWritten, isError, msg;
                licont > liarr ? isWritten = false : isWritten = true;

                if(isWritten){
                    isError = false;
                    msg = tempData.substring(0, liarr);

                    if(msg.toLowerCase().includes('error')){
                        isError = true;
                    }
                }
                else {
                    inside = true;
                }

                resolve({isWritten: isWritten, msg: msg, isError: isError});
            }

            if(data.trim() != '...'){
                totalData += data;
            }

        });

    });
}


/** ***********************************************************************
                                SETTINGS
    ***********************************************************************
*/

/*Calls the Listener for the respective settings element when a value has
changed. Also update the settings data after the required action is complete.*/
document.addEventListener('change', (e) => {

    function textFontListener(){
        swap.settingsData.font = document.getElementById('text-font').value;
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
