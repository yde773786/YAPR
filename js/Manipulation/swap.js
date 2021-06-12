/*Transition from one windo to another (within SPA) using methods provided
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
    console.log(consoleData);
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

}

/*Renders the next table row with required cells.*/
const newSlot = () => {
    let firstElement = '&gt;&gt;&gt;';
    let table = document.getElementById('interior');
    let row = table.insertRow(cnt.val++);

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    let status = document.createElement('SPAN');
    status.innerHTML = firstElement;
    status.style.color = "white";

    cell1.appendChild(status);

    let input = document.createElement('TEXTAREA');

    input.rows = "1";
    input.cols = "1";

    cell2.appendChild(input);
    input.focus();

}

/*Create the layout for settings*/
const settingsLayout = () => {
    console.log(consoleData);
    let body = document.getElementsByTagName("BODY")[0];
    clearBody(body);


}

module.exports = {
    consoleLayout, settingsLayout, consoleData, newSlot, cnt
}
