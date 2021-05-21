const {ipcRenderer} = require('electron')

var historyInput = [];
var pointer = 0;
var pointToEdit = {'0' : ''};

window.addEventListener('DOMContentLoaded', () => {
    newSlot();
    var info = document.getElementById('interpreter-info');
    info.innerHTML = 'No Interpreter Selected';
    info.style.color = "white";
    info.style.fontFamily = "monospace";
});

document.addEventListener('keyup', (e) => {
    if (e.target === historyInput[historyInput.length - 1]) {
        if(e.keyCode == 13){
            pointer = 0;
            pointToEdit = {'0' : ''};
            newSlot();
            ipcRenderer.send('history-update',
            historyInput[historyInput.length - 2].value);
            historyInput[historyInput.length - 2].disabled = true;
        }
        
        else if(e.keyCode == 38 || e.keyCode == 40){
            if(e.keyCode == 38){
                if(pointer != historyInput.length) {pointer++;}
            }
            else{
                if(pointer != 0) {pointer--;}
            }

            let currDisp = '';

            if(typeof(pointToEdit[pointer]) != 'undefined'){
                currDisp = pointToEdit[pointer];
            }
            else{
                currDisp = historyInput[historyInput.length - (pointer + 1)].value;
            }

            historyInput[historyInput.length - 1].value = currDisp;
        }
        else{
            pointToEdit[pointer] =
            historyInput[historyInput.length - 1].value;
        }
    }
});

ipcRenderer.on('interpreter', (event, data) =>{
    var info = document.getElementById('interpreter-info');
    if(data.toLowerCase().includes("python")){
        info.innerHTML = data;
    }
    else{
        info.innerHTML = "No Valid Interpreter Selected";
    }
});

function newSlot(continuation=false) {
    let firstElement = '&gt;&gt;&gt;';
    if(continuation){
        // TODO: increase height of element
    }

    let table = document.getElementById('interior');
    let row = table.insertRow(historyInput.length);

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    cell1.style.width = "5%";
    cell2.style.width = "95%";

    let status = document.createElement('SPAN');
    status.innerHTML = firstElement;
    status.style.color = "white";

    cell1.appendChild(status);

    let input = document.createElement('INPUT')
    input.style.color = "white";
    input.style.background = "transparent";
    input.style.width = "100%"
    input.style.fontFamily = "monospace";

    historyInput.push(input);

    cell2.appendChild(input);
    input.focus();
}
