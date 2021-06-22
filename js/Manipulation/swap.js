/*Transition from one window to another (within SPA) using methods provided
here.*/

var settingsData = {historyLimit: 'medium', theme: 'styled-dark', errorDesc:
                    true, font: 'medium'};
var consoleData = {infoBox: undefined, input: [], output: []};
var cnt = {val: 0};

/*Clear the body*/
const clearBody = (body) => {
    body.innerHTML = '';
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

    let container = document.createElement('DIV');
    container.id = "container";
    body.appendChild(container);

    let interior = document.createElement('TABLE');
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

    body.innerHTML = '<h1>History Limit</h1>\
        <hr>\
        <div class="options">\
            <label for="history-limit">Number of commands that are stored\
            in history.</label>\
            <select id="history-limit">\
                <option value="small">250</option>\
                <option value="medium">500</option>\
                <option value="large">1000</option>\
            </select>\
        </div>\
        \
        <h1>Themes</h1>\
        <hr>\
        <div class="options">\
            <label for="themes">General appearence of the python console.</label>\
            <select id="themes">\
                <option value="styled-dark">Styled Dark</option>\
                <option value="styled-light">Styled Light</option>\
                <option value="classic">Classic</option>\
            </select>\
        </div>\
        \
        <h1>Error Description</h1>\
        <hr>\
        <div class="options">\
            <label for="switch">Filter out standard error for human readability</label>\
            <input type="checkbox" id="switch" checked="true"/>\
            <label for="switch"></label>\
        </div>\
        \
        <h1>Text Font</h1>\
        <hr>\
        <div class="options final-setting">\
            <label for="text-font">Font size of I/O in console.</label>\
            <select id="text-font">\
                <option value="small">Small</option>\
                <option value="medium">Medium</option>\
                <option value="large">Large</option>\
            </select>\
        </div>';

        getSettings();
}

const getSettings = () => {
    document.getElementById('history-limit').value = settingsData.historyLimit;
    document.getElementById('themes').value = settingsData.theme;
    document.getElementById('switch').checked = settingsData.errorDesc;
    document.getElementById('text-font').value = settingsData.font;
}

const setSettings = () => {
    settingsData.historyLimit = document.getElementById('history-limit').value;
    settingsData.theme = document.getElementById('themes').value;
    settingsData.errorDesc = document.getElementById('switch').checked;
    settingsData.font = document.getElementById('text-font').value
}

module.exports = {
    consoleLayout, settingsLayout, consoleData, newInputSlot, newOutputSlot, cnt,
    setSettings
}
