/*Transition from one window to another (within SPA) using methods provided
here.*/

const settings = require('../Utils/settings.js');
const consoles = require('../Utils/console.js');

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

    if(consoles.consoleData.infoBox !== undefined){
        intInfo.innerHTML = consoles.consoleData.infoBox.text;
    }

    let container = document.createElement('DIV');
    container.id = "container";
    body.appendChild(container);

    let interior = document.createElement('TABLE');
    interior.id = "interior";
    container.appendChild(interior)

    for(let i = 0; i < consoles.consoleData.slot.length; i++){
        if(consoles.consoleData.slot[i].type === 'input'){
            consoles.newInputSlot(consoles.consoleData.slot[i]);
        }
        else{
            consoles.newOutputSlot(consoles.consoleData.slot[i]);
        }
    }

    intInfo.className = 'console-' + settings.settingsData.font;
    container.className = 'console-' + settings.settingsData.font;

    settings.adjustTheme();
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

        settings.adjustTheme();
        settings.adjustFont();
        settings.getSettings();
}

module.exports = {
    consoleLayout, settingsLayout
}
