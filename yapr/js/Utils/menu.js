/*Manages functionality of context menu*/

const {ipcRenderer} = require('electron');

/*Functionality for when input is paused*/
const pauseListener = () => {
    ipcRenderer.send("Menu", true);
}

/*Functionality for when input is resumed*/
const resumeListener = () => {
    ipcRenderer.send("Menu", false);
}

module.exports = {pauseListener, resumeListener}
