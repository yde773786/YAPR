const {ipcRenderer} = require('electron')

var historyInput = [];
var curr = null;
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
    if (e.target === curr) {

        if(e.keyCode == 13){
            pointer = 0;
            pointToEdit = {'0' : ''};
            ipcRenderer.send('history-update', curr.value);
            historyInput.push(curr.value);
            curr.disabled = true;
            newSlot();
        }

        else if(e.keyCode == 38 || e.keyCode == 40){

            if(e.keyCode == 38){
                if(pointer != historyInput.length){
                    pointer++;
                }
            }
            else{
                if(pointer != 0) {
                    pointer--;
                }
            }

            let currDisp = '';

            if(typeof(pointToEdit[pointer]) != 'undefined'){
                currDisp = pointToEdit[pointer];
            }
            else{
                currDisp = historyInput[historyInput.length - pointer];
            }

            curr.value = currDisp;
        }
        else{
            pointToEdit[pointer] = curr.value;
        }
    }
});

ipcRenderer.on('interpreter', (event, data) =>{
    var info = document.getElementById('interpreter-info');
    if(data.pi.toLowerCase().includes("python")){
        info.innerHTML = data.pi;
    }
    else{
        info.innerHTML = "No Valid Interpreter Selected";
    }

    historyInput = data.hs;
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

    curr = input;

    cell2.appendChild(input);
    input.focus();
}
