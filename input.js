const {ipcRenderer} = require('electron')
const { spawn } = require('child_process');

var historyInput = [];
var curr = null;
var cnt = 0;
var pointer = 0;
var pointToEdit = {'0' : {value: '', space: 0}};
var py;

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
            curr.rows++;

            if(true){
                pointer = 0;
                pointToEdit = {'0' : {value: '', space: 1}};

                py.stdin.write(curr.value);
                newestAddition = {value: curr.value, space: curr.rows};

                ipcRenderer.send('history-update', newestAddition);
                historyInput.push(newestAddition);

                curr.disabled = true;
                console.log(curr.rows);
                newSlot();
            }
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
            let currRows = 0;

            if(typeof(pointToEdit[pointer]) != 'undefined'){
                currDisp = pointToEdit[pointer].value;
                currRows = pointToEdit[pointer].space;
            }
            else {
                currDisp = historyInput[historyInput.length - pointer].value;
                currRows = historyInput[historyInput.length - pointer].space;
            }

            curr.value = currDisp;
            curr.rows = currRows;
        }
        else{
            pointToEdit[pointer] = {value: '', space: 0};
            pointToEdit[pointer].value = curr.value;
            currRows = curr.rows;
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

    if(typeof(data.hs) != 'undefined'){
        historyInput = data.hs;
    }

    if(info.innerHTML != "No Valid Interpreter Selected"){
        console.log(info.innerHTML);
        py = spawn(data.pt, ["-i"]);

        py.stdout.on("data", (data) => {
          console.log(data.toString());
        });
    }

});

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
