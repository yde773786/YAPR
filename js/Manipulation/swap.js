/*Transition from one window to another (within SPA) using methods provided
here.*/

var settingsData, consoleData = {infoBox: undefined, input: [], output: []};
var cnt = {val: 0};

/*Clear the body*/
const clearBody = (body) => {
    while(body.firstChild){
        body.removeChild(body.lastChild);
    }
}

/*Create the layout for console*/
const consoleLayout = () => {

    let body = document.getElementsByTagName("BODY")[0];
    clearBody(body);

    let intInfo = document.createElement('DIV')
    intInfo.id = "interpreter-info";
    body.appendChild(intInfo);

    if(consoleData.infoBox !== undefined){
        intInfo.innerHTML = consoleData.infoBox.text;
    }

    let container = document.createElement('DIV')
    container.id = "container";
    body.appendChild(container);

    let interior = document.createElement('TABLE')
    interior.id = "interior";
    container.appendChild(interior)

    for(let i = 0; i < consoleData.input.length; i++){
        newInputSlot(consoleData.input[i]);
        newOutputSlot(consoleData.output[i]);
    }

}

/*Renders the next table row with required INPUT cells.
newInputSlot deals with receiving new input and reloading previous
input, depending on the paramenters.*/
const newInputSlot = (inBox = undefined) => {

    let firstElement = '&gt;&gt;&gt;';
    let table = document.getElementById('interior');
    let row = table.insertRow(cnt.val++);

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    let status = document.createElement('SPAN');
    status.innerHTML = firstElement;
    cell1.appendChild(status);

    let input = document.createElement('TEXTAREA');
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
}

/*Renders the next table row with required OUTPUT cells.
newOutputSlot deals with receiving new output and reloading previous
output, depending on the paramenters.*/
const newOutputSlot = (outBox) => {

    let table = document.getElementById('interior');
    let row = table.insertRow(cnt.val++);

    let cell = row.insertCell(0);
    cell.colSpan = 2;

    let output = document.createElement('P');
    let strOut = outBox.msg;

    if(outBox.isError){
        output.innerHTML = strOut.fontcolor("red");
    }
    else{
        output.innerHTML = strOut.fontcolor("white");
    }

    cell.appendChild(output);
}

/*Create the layout for settings*/
const settingsLayout = () => {
    let body = document.getElementsByTagName("BODY")[0];
    clearBody(body);


}

module.exports = {
    consoleLayout, settingsLayout, consoleData, newInputSlot, newOutputSlot, cnt
}
