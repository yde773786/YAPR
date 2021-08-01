/*Manages functionality of context menu*/

const consoles = require('../Utils/console.js');

/*Functionality for when input is paused*/
const pauseListener = () => {
    consoles.consoleData.curr.classList.add("paused");
}

/*Functionality for when input is resumed*/
const resumeListener = (toResume) => {
    toResume.classList.remove("paused");
}

module.exports = {pauseListener, resumeListener}
