/*Manipulation of textarea with respect to indentation*/

const nextLine = function (curr){
    curr.rows++;
    curr.value = curr.value + '\n';
};

module.exports = {
    nextLine
}
