const {ipcRenderer} = require('electron');
const { spawn } = require('child_process');
const indent = require('./Manipulation/indent.js');

var historyInput = [];
var curr = null;
var cnt = 0;
var pointer = 0;
var pointToEdit = {'0' : {value: '', space: 1}};
var py;
var proceed;
var inside = false;

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
                pointer = 0;
                pointToEdit = {'0' : {value: '', space: 1}};

                let currStr = (curr.value).split('\n');
                let i = 0;

                async function evaluation(){

                    //Take in input and deal with it one at a time
                    for(i = 0; i < currStr.length - 1; i++){
                        // If continuation block, get the last input in curr.
                        // Otherwise just the current value in curr.

                        //Only concerned with single lined input and handling
                        //the stdout and stderr associated with it.
                        console.log(currStr[i] + '\n');
                         py.stdin.write(currStr[i] + '\n');
                         hi = await executeInput(currStr[i]);
                         console.log(hi);
                    }
                    console.log(currStr[i] + '\n');
                    //Deals with the final result
                     py.stdin.write(currStr[i] + '\n');
                    outType = await executeInput(currStr[i] + '\n');
                    console.log(outType);
                    if(inside){
                        indent.nextLine(curr);
                    }
                    else{

                        function stderrDealer(){
                            if(outType[0] === 'valid'){
                                return false;
                            }
                            else if(outType[1].toLowerCase().includes('error')){
                                return true;
                            }

                            return false;
                        }

                        if(outType[0] === 'valid' || stderrDealer()){
                            let table = document.getElementById('interior');
                            let row = table.insertRow(cnt++);

                            let cell = row.insertCell(0);
                            cell.colSpan = 2;

                            let output = document.createElement('P');
                            let strOut = outType[1];

                            output.style.whiteSpace = "pre-wrap";

                            if(outType[0] === 'valid'){
                                output.innerHTML = strOut.fontcolor("white");
                            }
                            else{
                                output.innerHTML = strOut.fontcolor("red");
                            }
                            cell.appendChild(output);
                        }

                        //Replace leading and trailing NEWLINES ONLY.
                        curr.disabled = true;

                        newestAddition = {value: curr.value, space: curr.rows};
                        ipcRenderer.send('history-update', newestAddition);
                        historyInput.push(newestAddition);

                        newSlot();
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
            curr.rows = curr.value.split('\n').length
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
        py = spawn(data.pt, ["-i"]);

        /*Send in dummy input for initial version stderr removal*/
        py.stdin.write('dummy\n');

        function dummyPromise() {
            return new Promise(function(resolve) {
                py.stderr.once("data", (data) => {
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

        py.stdout.once("data", (data) => {
            resolve(['valid', data.toString()]);
        });

        py.stderr.once("data", (data) => {
            if(data.toString() === '... '){
                inside = true;
                resolve(['invalid', data.toString()]);
            }
            else if(!data.includes('>>>')){
                resolve(['invalid', data.toString()]);
            }
        //     console.log(data.toString());
        //     resolve(['invalid', data.toString().
        //     replace('>>>', '')]);
        });
    });
}