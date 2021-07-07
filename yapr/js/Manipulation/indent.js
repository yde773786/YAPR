/*Manipulation of textarea with respect to indentation*/

const nextLine = (curr) => {
    let selectStr = curr.value.substr(0, curr.selectionStart).split('\n');
    let currIndex = selectStr.length - 1;

    /*Find current indentation level.*/
    const findTab = () => {
        let currTab = 0;

        let i = 0;
        while(i < selectStr[currIndex].length && selectStr[currIndex][i] == '\t'){
            currTab++;
            i++;
        }

        return selectStr[currIndex].trim()[selectStr[currIndex].trim().length - 1] == ':' ? currTab + 1 : currTab;
    }

    /*Checks if each open bracket (not within strings) is closed with a
    corresponding close bracket*/
    const bracketComplete = () => {

        let inQuotes = false;
        let bracketOpen = {'{': 0, '[': 0, '(': 0};
        let associateClose = {'}': '{', ']': '[', ')': '('};

        for(let i = 0; i < curr.selectionStart; i++){

            if(curr.value[i] == '"' || curr.value[i] == "'"){
                inQuotes = !inQuotes;
            }
            else if ((curr.value[i] == '{' || curr.value[i] == '[' || curr.value[i] == '(') && !inQuotes) {
                bracketOpen[curr.value[i]]++;
            }
            else if((curr.value[i] == '}' || curr.value[i] == ']' || curr.value[i] == ')') && !inQuotes){
                bracketOpen[associateClose[curr.value[i]]]--;
            }

        }

        return bracketOpen['{'] <= 0 && bracketOpen['['] <= 0 && bracketOpen['('] <= 0;
    }

    let allStr = [], selectionLineStart = 0, eachLine = '';

    let validationCurr = curr.value + '\n';
    //Replicate split('\n') for allStr as well as find index on current line
    for(let i = 0; i < validationCurr.length; i++){
        if(validationCurr[i] == '\n'){
            allStr.push(eachLine);
            eachLine = '';

            if(i <= curr.selectionStart){
                selectionLineStart = 0;
            }
        }
        else{
            eachLine += validationCurr[i];

            if(i <= curr.selectionStart){
                selectionLineStart++;
            }
        }
    }

    selectStr[currIndex] = allStr[currIndex]; // Get complete string for currIndex

    let tillSelectLine = selectStr.join('\n');
    let res = findTab();

    if(!bracketComplete()){
        let remaining = allStr[currIndex].substring(selectionLineStart);
        allStr[currIndex] = allStr[currIndex].substring(0, selectionLineStart);
        allStr.splice(currIndex + 1, 0, remaining);
    }
    else{
        if(res != 0){
            allStr.splice(currIndex + 1, 0, '\t'.repeat(res));
        }
        else {
            return false;
        }
    }

    curr.value = allStr.join('\n');
    curr.selectionStart = curr.selectionEnd = tillSelectLine.length + res + 1;
    curr.rows++;

    return true;
}

module.exports = {
    nextLine
}
