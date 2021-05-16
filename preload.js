var input;
var counter = 0;

window.addEventListener('DOMContentLoaded', () => {
    newSlot();
})

function newSlot(continuation=false) {
    let firstElement = '&gt;&gt;&gt;'
    if(continuation){
        firstElement = '...'
    }

    let table = document.getElementById('interior');
    let row = table.insertRow(counter++);

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    let status = document.createElement('SPAN');
    status.innerHTML = firstElement;
    status.style.color = "white";

    cell1.appendChild(status);

    let input = document.createElement('INPUT')
    input.style.color = "white";

    cell2.appendChild(input);
}
