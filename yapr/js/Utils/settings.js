/*Functionality provided by the settings screen*/

var settingsData = {historyLimit: '500', dark: false, errorDesc:
                    true, font: 'medium'};

const textFontListener = () =>{
    settingsData.font = document.getElementById('text-font').value;
    adjustFont();
};

const historyLimitListener = () => {
    settingsData.historyLimit = document.getElementById('history-limit').value;
    utils.historyUpdate(historyInput, settingsData.historyLimit);
    ipcRenderer.send('history-update');
};

const themeSwitchListener = () => {
    settingsData.dark = document.getElementById('theme-switch').checked;
    adjustTheme();
};

const errorSwitchListener = () => {
    settingsData.errorDesc = document.getElementById('err-switch').checked;
};

/*Fix the thematic coloring for HTML and settingsLayout*/
const adjustTheme = () => {

    settingsData.dark ? document.getElementsByTagName('HTML')[0].className = "black-back"
                       : document.getElementsByTagName('HTML')[0].className = "white-back";

    Array.prototype.slice.call(document.getElementsByTagName('SELECT')).forEach((select) => {
        select.classList.remove('black-fore', 'white-fore');
        settingsData.dark ? select.classList.add('black-fore') : select.classList.add('white-fore');
    });

}

/*Fix the font size for settingsLayout*/
const adjustFont = () => {

    Array.prototype.slice.call(document.getElementsByClassName('options')).forEach((option) => {
        option.classList.remove('options-small', 'options-medium', 'options-large');
        option.classList.add('options-' + settingsData.font);
    });

    Array.prototype.slice.call(document.getElementsByTagName('h1')).forEach((option) => {
        option.className = 'h1-' + settingsData.font;
    });

}


const getSettings = () => {
    document.getElementById('history-limit').value = settingsData.historyLimit;
    document.getElementById('theme-switch').checked = settingsData.dark;
    document.getElementById('err-switch').checked = settingsData.errorDesc;
    document.getElementById('text-font').value = settingsData.font;
}

module.exports = {textFontListener, historyLimitListener, themeSwitchListener, errorSwitchListener,
     settingsData, adjustTheme, adjustFont, getSettings};
