/*Manages functionality of context menu*/

const consoles = require('../Utils/console.js');

/*Functionality for when input is paused*/
const pauseListener = () => {
    consoles.consoleData.curr.classList.add("paused");
    consoles.consoleData.slot.push({value: consoles.consoleData.curr.value,
        space: consoles.consoleData.curr.rows, type: 'input', paused: true});
    consoles.newInputSlot();
}

/*Functionality for when input is resumed*/
const resumeListener = (toResume) => {
    toResume.classList.remove("paused");
    let inputIndex = Array.prototype.slice.call(document.getElementsByTagName("textarea")).indexOf(toResume);

    for(let i = 0; i < consoles.consoleData.slot.length; i++){
        if(consoles.consoleData.slot[i].type === 'input'){
            inputIndex--;
            if(inputIndex == 0){
                consoles.consoleData.slot[i].paused = false;
                break;
            }
        }
    }
}

module.exports = {pauseListener, resumeListener}
