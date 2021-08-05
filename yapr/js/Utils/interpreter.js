const constants = require('./constants.js');
const { spawn } = require('child_process');
const path = require('path');

var py;

/*Responsible for changing (or initializing) the interpreter for the
console. Returns whether interpreter is valid or not.*/
const changeInterpreter = async (piStr, interpreterPath) => {

    let proceed = false;

    if(piStr != "No Valid Interpreter Selected"){
        /*Mac & Linux run bash file, windows runs batch file*/
        process.platform === "win32" ?
        py = spawn(path.join(process.resourcesPath, constants.paths.windows), [interpreterPath])
        : py = spawn(path.join(process.resourcesPath, constants.paths.linux), [interpreterPath]);

        /*Remove unneeded verion information (from stderr)*/
        function dummyPromise() {
            return new Promise(function(resolve) {
                py.stdout.once("data", () => {
                    resolve();
                });
            });
        }

        await dummyPromise();
        proceed = true;
    }
    else{
        proceed = false;
    }

    return proceed;
};

/*Responsible for the execution of al input provided.*/
const executeInput = (isErrorDesc, totalData) => {

    /*Delay the normal execution of a key press of
    Enter key so that the execution of child process
    can occur.*/
    return new Promise((resolve) => {

        py.stdout.on("data", (data) => {

            let tempData = totalData;
            data = data.toString();
            tempData += data;

            /*Recognize extraneous '>>>' or '...' (from stderr) */
            function customLastIndexOf(mainStr, subStr){
                return mainStr.substring(mainStr.length - 3) == subStr ?
                mainStr.length - 3 : -1;
            }

            /* Also return if error is present or not. Only modify the output
            when the error is present and if the option to provide error Description
            is selected.*/
            function prettifyError(tempMsg, errorIndex, isError){

                if(isError){
                    let i = 1, errorName = '';

                    while(errorIndex - i >= 0 && tempMsg[errorIndex - i] != ' '
                            && tempMsg[errorIndex - i] != '\t'){
                        errorName = tempMsg[errorIndex - i] + errorName;
                        i++;
                    }
                    return errorName + tempMsg.substring(errorIndex);
                }
                else{
                    return tempMsg;
                }

            }

            tempData = tempData.trim();
            licont = customLastIndexOf(tempData, '...');
            liarr = customLastIndexOf(tempData, '>>>');

            if(data.trim() != '...'){
                totalData += data;
            }

            if(!(licont == -1 && liarr == -1)){

                let isWritten, isError = false, msg;
                licont > liarr ? isWritten = false : isWritten = true;

                if(isWritten){

                    if(isErrorDesc){
                        let firstArr = tempData.indexOf('>>>');
                        let tempMsg = tempData.substring(0, firstArr);

                        let errorIndex = tempMsg.lastIndexOf('Error');
                        isError = errorIndex != -1;

                        msg = prettifyError(tempMsg, errorIndex, isError);
                    }
                    else{
                        msg = tempData.substring(0, liarr);
                        isError = msg.includes('Error');
                    }

                }

                resolve({isWritten: isWritten, msg: msg, isError: isError, totalData: totalData});
            }

        });

    });
};

/*Provides an object that conatins all required details to create an
output text area for the multi-line input (inputstr) being provided*/
const outputResult = async (inputStr, isErrorDesc) => {
    let totalData = '';
    let i;

    //Take in input and deal with it one at a time
    for(i = 0; i < inputStr.length - 1; i++){
        // If continuation block, get the last input in consoleData.curr.
        // Otherwise just the current value in consoleData.curr.

        //Only concerned with single lined input and handling
        //the stdout associated with it.
         writeInput(inputStr[i] + '\n');
         totalData = (await executeInput(isErrorDesc, totalData)).totalData;

    }
    resetInput();

    //Deals with the final result
    writeInput(inputStr[i] + '\n');

    let bundle = await executeInput(isErrorDesc, totalData);
    let outType = {msg: bundle.msg, isError: bundle.isError, isWritten: bundle.isWritten, type: 'output'};

    if(!outType.isWritten){
        outType.msg = "YAPR error: Newline expected at end of input command.";
        outType.isError = true;

        /*Flush out stdin for custom YAPR error*/
        writeInput('dummy\n');
    }

    return Promise.resolve(outType);
};

/*Writes input into the python interpreter.*/
const writeInput = (string) => {
    py.stdin.write(string);
}

/*Removes all listeners to start next slot.*/
const resetInput = () => {
    py.stdout.removeAllListeners(['data']);
}

module.exports = {changeInterpreter, executeInput, writeInput, resetInput, outputResult}
