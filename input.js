const {ipcRenderer} = require('electron')

var counter = 0;

window.addEventListener('DOMContentLoaded', () => {
    newSlot();
    var info = document.getElementById('interpreter-info');
    info.innerHTML = 'No Interpreter Selected';
    info.style.color = "white";
    info.style.fontFamily = "monospace";
})

document.addEventListener('keyup', (e) => {
    if(e.keyCode == 13 && e.target.id == 'second' + (counter - 1)){
        newSlot();
    }
})

ipcRenderer.on('interpreter', (event, data) =>{
    var info = document.getElementById('interpreter-info');
    if(data.toString().toLowerCase().includes("python")){
        info.innerHTML = data.toString();
    }
    else{
        info.innerHTML = "No Valid Interpreter Selected";
    }
});

function newSlot(continuation=false) {
    let firstElement = '&gt;&gt;&gt;'
    if(continuation){
        firstElement = '...'
    }

    let table = document.getElementById('interior');
    let row = table.insertRow(counter);

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

    status.id = "first" + counter;
    input.id = "second" + counter;

    counter++;
    cell2.appendChild(input);
}
