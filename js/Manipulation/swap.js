/*Transition from one windo to another (within SPA) using methods provided
here.*/

/*Clear the body*/
const clearBody = (body) => {
    while(body.firstChild){
        body.removeChild(body.lastChild);
    }
}

/*Create the layout for io*/
const ioLayout = () => {
    let body = document.getElementsByTagName("BODY")[0];
    clearBody(body);

    let intInfo = document.createElement('DIV')
    intInfo.id = "interpreter-info";
    body.appendChild(intInfo);

    let container = document.createElement('DIV')
    container.id = "container";
    body.appendChild(container);

    let interior = document.createElement('TABLE')
    interior.id = "interior";
    container.appendChild(interior);
}

/*Create the layout for settings*/
const settingsLayout = () => {
    let body = document.getElementsByTagName("BODY")[0];
    clearBody(body);


}

module.exports = {
    ioLayout, settingsLayout
}
