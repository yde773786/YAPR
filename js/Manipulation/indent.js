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

    let allStr = curr.value.split('\n');
    selectStr[currIndex] = allStr[currIndex]; // Get complete string for currIndex

    if(curr.selectionStart < selectStr.join('\n').trim().length - 1){
        return false;
    }
    let res = findTab();

    if(res != 0){
        allStr.splice(currIndex + 1, 0, '\t'.repeat(res));

    }
    else {
        if(currIndex == selectStr.length - 1){
            allStr.splice(currIndex + 1, 0, '');
            return false;
        }
    }

    curr.value = allStr.join('\n');
    curr.rows++;
    return true;
}

module.exports = {
    nextLine
}
