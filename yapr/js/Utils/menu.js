/*Manages functionality of context menu*/

const consoles = require('./console.js');
const interpreter = require('./interpreter.js')
const settings = require('./settings.js');

/*Functionality for when input is paused*/
const pauseListener = () => {
    consoles.consoleData.curr.classList.add("paused");
    consoles.consoleData.curr.disabled = true;
    consoles.consoleData.slot.push({value: consoles.consoleData.curr.value,
        space: consoles.consoleData.curr.rows, type: 'input', paused: true});
    consoles.newInputSlot();
}

/*Functionality for when input is resumed*/
const resumeListener = async (toResume) => {
    toResume.classList.remove("paused");
    let inputIndex = Array.prototype.slice.call(document.getElementsByTagName("textarea")).indexOf(toResume);

    for(let i = 0; i < consoles.consoleData.slot.length; i++){
        if(consoles.consoleData.slot[i].type === 'input'){
            inputIndex--;
            if(inputIndex == -1){
                currSlot = consoles.consoleData.slot[i];
                currSlot.paused = false;
                let currStr = (currSlot.value).split('\n');

                outType = await interpreter.outputResult(currStr, settings.settingsData.errorDesc);
                consoles.newOutputSlot({msg: outType.msg, isError: outType.isError});
                break;
            }
        }
    }
}

module.exports = {pauseListener, resumeListener}
