/*Manipulation of textarea with respect to indentation*/
var currTab = 0;

const nextLine = (curr) => {
    curr.rows++;

    if(curr.value.trim()[curr.value.trim().length - 1] == ':'){
        currTab++;
    }
    else{
        currLast = curr.value.split('\n').pop()
        currTab = 0;

        while(currLast[0] == '\t'){
            currTab++;
            currLast = currLast.substring(1);
        }
    }
    curr.value += '\n' + '\t'.repeat(currTab);
};

const resetTab = () => {
    currTab = 0;
}

module.exports = {
    nextLine, resetTab
}
