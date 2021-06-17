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

        return selectStr[currIndex].trim()[selectStr[currIndex].trim().length - 1] ==
                                                ':' ? currTab + 1 : currTab;
    }

    /*Checks if each open bracket (not within strings) is closed with a
    corresponding close bracket*/
    const bracketComplete = () => {

        let inQuotes = false;
        let bracketOpen = {'{': 0, '[': 0};
        let associateClose = {'}': '{', ']': '['};

        for(let i = 0; i < curr.value.length; i++){

            if(curr.value[i] == '"' || curr.value[i] == "'"){
                inQuotes = !inQuotes;
            }
            else if ((curr.value[i] == '{' || curr.value[i] == '[') && !inQuotes) {
                bracketOpen[curr.value[i]]++;
            }
            else if((curr.value[i] == '}' || curr.value[i] == ']') && !inQuotes){
                bracketOpen[associateClose[curr.value[i]]]--;
            }

        }

        return bracketOpen['{'] <= 0 && bracketOpen['['] <= 0;
    }

    let allStr = curr.value.split('\n');
    selectStr[currIndex] = allStr[currIndex]; // Get complete string for currIndex

    let tillSelectLine = selectStr.join('\n');

    if(curr.selectionStart < tillSelectLine.trim().length - 1){
        return false;
    }
    let res = findTab();

    if(res != 0){
        allStr.splice(currIndex + 1, 0, '\t'.repeat(res));
    }
    else if(currIndex == selectStr.length - 1) {
        if(bracketComplete()){
            return false;
        }
        else{
            allStr.splice(currIndex + 1, 0, '');
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
