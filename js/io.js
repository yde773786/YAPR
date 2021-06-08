const {ipcRenderer} = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const indent = require('./Manipulation/indent.js');

var historyInput = [];
var curr = null;
var cnt = 0;
var pointer = 0;
var pointToEdit = {'0' : {value: '', space: 1}};
var py;
var proceed;
var inside = false;
var totalData = '';

/* When window opens, have one textarea ready for input. */
window.addEventListener('DOMContentLoaded', () => {
    newSlot();
    var info = document.getElementById('interpreter-info');
    info.innerHTML = 'No Interpreter Selected';
    info.style.color = "white";
    info.style.fontFamily = "monospace";
});

/*Enter key persists input as well as creates a
new textarea for new input. Extra newlines must
be trimmed accordingly.*/
document.addEventListener('keyup', (e) => {
    if (e.target === curr) {

        if(e.keyCode == 13){

            if(proceed){
                let currStr = (curr.value).split('\n');;

                /*Interpret everything line-by-line if command from
                history log. BUT only last line if new command.*/
                if(pointer == 0 && inside){
                    currStr = [currStr.pop()]
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

                    if(inside){
                        indent.nextLine(curr);
                    }
                    else{
                        indent.resetTab();
                        
                        if(outType.isWritten){
                            let table = document.getElementById('interior');
                            let row = table.insertRow(cnt++);

                            let cell = row.insertCell(0);
                            cell.colSpan = 2;

                            let output = document.createElement('P');
                            let strOut = outType.msg;

                            output.style.whiteSpace = "pre-wrap";

                            if(outType.isError){
                                output.innerHTML = strOut.fontcolor("red");
                            }
                            else{
                                output.innerHTML = strOut.fontcolor("white");
                            }

                            cell.appendChild(output);
                        }

                        //Replace leading and trailing NEWLINES ONLY.
                        curr.disabled = true;

                        newestAddition = {value: curr.value, space: curr.rows};
                        ipcRenderer.send('history-update', newestAddition);
                        historyInput.push(newestAddition);

                        newSlot();
                        totalData = '';
                    }
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
    if (e.target === curr) {

        if(e.keyCode == 38 || e.keyCode == 40){
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

        if(e.keyCode == 9){
            e.preventDefault();

            let head = curr.selectionStart;
            let tail = curr.selectionEnd;

            curr.value = curr.value.substring(0, head) + "\t" + curr.
            value.substring(tail);
        }

        if(e.keyCode == 13){
            e.preventDefault();
        }
    }
});

/*Check if interpreter input is valid. If so, proceed.
Else, give a warning to enter valid interpreter.*/
ipcRenderer.on('interpreter', (event, data) =>{
    var info = document.getElementById('interpreter-info');

    if(data.pi.toLowerCase().includes("python")){
        info.innerHTML = data.pi;
    }
    else{
        info.innerHTML = "No Valid Interpreter Selected";
    }

    if(typeof(data.hs) != 'undefined'){
        historyInput = data.hs;
    }

    if(info.innerHTML != "No Valid Interpreter Selected"){

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

});

/*Clears the console.*/
ipcRenderer.on('clear', (e) => {
    let table = document.getElementById('interior');
    while(table.rows.length > 0) {
        table.deleteRow(0);
    }

    cnt = 0;
    newSlot();
});

/*Renders the next table row with required cells.*/
function newSlot() {

    let firstElement = '&gt;&gt;&gt;';
    let table = document.getElementById('interior');
    let row = table.insertRow(cnt++);

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    cell1.style.width = "5%";
    cell2.style.width = "95%";

    let status = document.createElement('SPAN');
    status.innerHTML = firstElement;
    status.style.color = "white";

    cell1.appendChild(status);

    let input = document.createElement('TEXTAREA');

    input.rows = "1";
    input.cols = "1";

    input.style.color = "white";
    input.style.background = "transparent";
    input.style.width = "100%"
    input.style.fontFamily = "monospace";
    input.style.overflow = "hidden";

    curr = input;

    cell2.appendChild(input);
    input.focus();
}

function executeInput() {

    /*Delay the normal execution of a key press of
    Enter key so that the execution of child process
    can occur.*/
    return new Promise((resolve) => {
        inside = false;

        py.stdout.on("data", (data) => {

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
