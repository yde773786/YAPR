/*Functionality provided by the settings screen*/

const utils = require('../Utils/miscellaneous.js');
const interpreter = require('../Utils/interpreter.js')
const {ipcRenderer} = require('electron');
const indent = require('../Manipulation/indent.js');
const settings = require('./settings.js');

var consoleData = {infoBox: undefined, input: [], output: [], curr: undefined,
                    historyInput: [], pointer: 0};

var pointToEdit = {'0' : {value: '', space: 1}};

/*The front end for the execution process of each command through execute
Excute each line -> Display output -> add to history -> New input slot*/
async function evaluation(){

    let currStr = (consoleData.curr.value).split('\n');
    let i;
    let totalData = '';

    //Take in input and deal with it one at a time
    for(i = 0; i < currStr.length - 1; i++){
        // If continuation block, get the last input in consoleData.curr.
        // Otherwise just the current value in consoleData.curr.

        //Only concerned with single lined input and handling
        //the stdout associated with it.
         interpreter.writeInput(currStr[i] + '\n');
         totalData = (await interpreter.executeInput(settings.settingsData.errorDesc, totalData)).totalData;

    }
    interpreter.resetInput();

    //Deals with the final result
    interpreter.writeInput(currStr[i] + '\n');

    let bundle = await interpreter.executeInput(settings.settingsData.errorDesc, totalData);
    let outType = {msg: bundle.msg, isError: bundle.isError, isWritten: bundle.isWritten};
    totalData = bundle.totalData;

    if(!outType.isWritten){
        outType.msg = "YAPR error: Newline expected at end of input command.";
        outType.isError = true;

        /*Flush out stdin for custom YAPR error*/
        interpreter.writeInput('dummy\n');
        totalData = (await interpreter.executeInput(settings.settingsData.errorDesc, totalData)).totalData;
    }

    newOutputSlot({msg: outType.msg, isError: outType.isError});
    consoleData.output.push(outType);

    //Replace leading and trailing NEWLINES ONLY.
    consoleData.curr.disabled = true;

    let newestAddition = {value: consoleData.curr.value, space: consoleData.curr.rows};
    consoleData.input.push(newestAddition);

    if(newestAddition.value.trim() != ''){
        ipcRenderer.send('history-update', newestAddition);
        utils.historyUpdate(consoleData.historyInput, settings.settingsData.historyLimit, newestAddition);
    }

    totalData = '';
    newInputSlot();
}

/*Functionality for when Enter button is pressed.
If can process, proceed to evaluate. Else, display a warning.*/
const enterPressedListener = (proceed) => {
    if(proceed){
        if(indent.nextLine(consoleData.curr)){
            return;
        }

        pointToEdit = {'0' : {value: '', space: 1}};
        consoleData.pointer = 0;

        evaluation();
    }
    else{
        ipcRenderer.send('cannot-interpret');
        //Replace leading and trailing NEWLINES ONLY.
        consoleData.curr.rows = 1;
    }
};

/*Functionality for when Tab button is pressed.
Traditional tab in text editor is applied to acive textarea*/
const tabPressedListener = () => {

    let head = consoleData.curr.value.substring(0, consoleData.curr.selectionStart);
    let tail = consoleData.curr.value.substring(consoleData.curr.selectionEnd);

    consoleData.curr.value = head + "\t" + tail;
    consoleData.curr.selectionStart = consoleData.curr.selectionEnd = head.length + 1;
};

/*Functionality for when Up/Down arrow pressed.
Use the history stored and index updated by the Up/Down click
to refresh content in current textarea.*/
const arrowPressedListener = (isArrowUp) => {

    let currDisp = consoleData.curr.value;
    let currRows = consoleData.curr.rows;
    let temp = consoleData.pointer;

    if(isArrowUp && consoleData.pointer != consoleData.historyInput.length){
        consoleData.pointer++;
    }
    else if(!isArrowUp && consoleData.pointer != 0){
        consoleData.pointer--;
    }

    if(typeof(pointToEdit[consoleData.pointer]) != 'undefined'){
        currDisp = pointToEdit[consoleData.pointer].value;
        currRows = pointToEdit[consoleData.pointer].space;
    }
    else if(temp != consoleData.pointer) {
        currDisp = consoleData.historyInput[consoleData.historyInput.length - consoleData.pointer].value;
        currRows = consoleData.historyInput[consoleData.historyInput.length - consoleData.pointer].space;
    }

    consoleData.curr.value = currDisp;
    consoleData.curr.rows = currRows;

}

/*When any other key is pressed, chabge textarea size and temporary history as
required dynamically.*/
const otherPressedListener = () => {
    consoleData.curr.rows = consoleData.curr.value.split('\n').length;
    pointToEdit[consoleData.pointer] = {value: consoleData.curr.value, space: consoleData.curr.rows};
};

/*Renders the next table row with required INPUT cells.
newInputSlot deals with receiving new input and reloading previous
input, depending on the paramenters.*/
const newInputSlot = (inBox = undefined) => {

    let firstElement = '&gt;&gt;&gt;';
    let table = document.getElementById('interior');
    let row = table.insertRow(utils.misc.cnt++);

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    let status = document.createElement('SPAN');
    status.innerHTML = firstElement;
    cell1.appendChild(status);

    let input = document.createElement('TEXTAREA');
    input.autoComplete = "on";
    cell2.appendChild(input);
    input.cols = 1;

    if(inBox === undefined){
        input.rows = 1;
        input.focus();
    }
    else{
        input.rows = inBox.space;
        input.value = inBox.value;
        input.disabled = true;
    }
    consoleData.curr = input;

    input.classList.remove('black-fore', 'white-fore');
    settings.settingsData.dark ? input.classList.add('black-fore', 'console-' + settings.settingsData.font) :
                        input.classList.add('white-fore', 'console-' + settings.settingsData.font);
}

/*Renders the next table row with required OUTPUT cells.
newOutputSlot deals with receiving new output and reloading previous
output, depending on the paramenters.*/
const newOutputSlot = (outBox) => {

    let table = document.getElementById('interior');
    let row = table.insertRow(utils.misc.cnt++);

    let cell = row.insertCell(0);
    cell.colSpan = 2;

    let output = document.createElement('P');
    let strOut = outBox.msg;

    if(outBox.isError){
        output.innerHTML = strOut.fontcolor("red");
    }
    else{
        output.innerHTML = settings.settingsData.dark ? strOut.fontcolor("white") : strOut.fontcolor("black");
    }

    cell.appendChild(output);
}

module.exports = {consoleData, evaluation, newInputSlot, newOutputSlot, enterPressedListener,
                    otherPressedListener, tabPressedListener, arrowPressedListener};
