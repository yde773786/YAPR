/*Transition from one window to another (within SPA) using methods provided
here.*/

var settingsData = {historyLimit: 'medium', dark: false, errorDesc:
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

    adjustTheme();
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

    settingsData.dark ? input.classList.add('black-fore') : input.classList.add('white-fore');
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
                <option value="250">250</option>\
                <option value="500">500</option>\
                <option value="1000">1000</option>\
            </select>\
        </div>\
        \
        <h1>Dark Mode</h1>\
        <hr>\
        <div class="options">\
            <label for="theme-switch">Give the console appearence a darker theme.</label>\
            <input type="checkbox" id="theme-switch" checked="true"/>\
            <label for="theme-switch"></label>\
        </div>\
        \
        <h1>Error Description</h1>\
        <hr>\
        <div class="options">\
            <label for="err-switch">Filter out standard error for human readability.</label>\
            <input type="checkbox" id="err-switch" checked="true"/>\
            <label for="err-switch"></label>\
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

        adjustTheme();
        getSettings();
}

/*Fix the thematic coloring for consoleLayout and settingsLayout*/
const adjustTheme = () => {

    settingsData.dark ? document.getElementsByTagName('HTML')[0].className = "black-back"
                       : document.getElementsByTagName('HTML')[0].className = "white-back";

    Array.prototype.slice.call(document.getElementsByTagName('SELECT')).forEach((select) => {
        settingsData.dark ? select.className = 'black-fore' : select.className = 'white-fore';
    });

}


const getSettings = () => {
    document.getElementById('history-limit').value = settingsData.historyLimit;
    document.getElementById('theme-switch').checked = settingsData.dark;
    document.getElementById('err-switch').checked = settingsData.errorDesc;
    document.getElementById('text-font').value = settingsData.font;
}

module.exports = {
    consoleLayout, settingsLayout, consoleData, newInputSlot, newOutputSlot, cnt,
     settingsData, adjustTheme
}
