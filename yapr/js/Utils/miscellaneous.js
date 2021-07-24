/*Used common logic*/

/*Update arrays that contain history log of commands*/
const historyUpdate = (history, limit, newestAddition) => {
    while(history.length > limit){
        history.shift();
    }

    if(newestAddition != undefined){
        if(history.length == limit){
            history.shift();
        }
        history.push(newestAddition);
    }
};

module.exports = {
    historyUpdate
}
