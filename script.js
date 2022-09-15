let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalBox = document.querySelector(".modal-box");
let modalBoxTextArea = document.querySelector(".text-area textArea");
let mainContainer = document.querySelector(".main-container");
let allPriorityColors = document.querySelectorAll(".colors");
let lockBtn = document.querySelector(".lock-button");
let toolBoxColors = document.querySelectorAll(".color");

let colors = ["lightpink", "blue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];
let addFlag = false;
let removeFlag = false;
let ticketsArr = [];


// using local storage to create tickets and diplay on console.

if(localStorage.getItem("jira_tickets")){
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketContent, ticketObj.ticketId);
    })
}

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";


// ------------------------------------------- add button event listener -----------------------------------------

addBtn.addEventListener("click", (e) => {
    console.log(addFlag);
    addFlag = !addFlag;
    if (addFlag) {
        modalBox.style.display = "flex";
        addBtn.style.backgroundColor = "green";
    }
    else {
        modalBox.style.display = "none";
        addBtn.style.backgroundColor = "lightseagreen";
    }
})

// ------------------------------------------- modal box event listener -----------------------------------------

modalBox.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === 'Shift') {
        createTicket(modalPriorityColor, modalBoxTextArea.value);
        
        setModalToDefault();
        addBtn.style.backgroundColor = "lightseagreen";
        addFlag = false;
    }
})

// -------------------------------------   createTicket Function    -----------------------------------------------

function createTicket(ticketColor, ticketContent, ticketId) {
    let id = ticketId || shortid();
    let ticketBox = document.createElement("div");
    ticketBox.classList.add("ticket-box");
    ticketBox.innerHTML = `
                            <div class="ticket-color ${ticketColor}">
                            </div>
                            <div class="ticket-id">"#${id}"</div>
                            <div class="ticket-content">
                                ${ticketContent}
                            </div>
                            <div class="lock-icon-box">
                                <i class="lock-button fa-solid fa-lock"></i>
                            </div>
                        `;
    mainContainer.appendChild(ticketBox);

    // create object of ticket and add to array
    if (!ticketId) {
        ticketsArr.push({ ticketColor, ticketContent, ticketId: id });
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    }

    handleRemoval(ticketBox, id);
    handleLock(ticketBox, id);
    handleColor(ticketBox, id);
}

// -------------------------------------   HandleRemoval Function    -----------------------------------------------

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
    if(removeFlag === true){
        removeBtn.style.backgroundColor = "black";
    }
    else{
        removeBtn.style.backgroundColor = "lightseagreen";
    }
    console.log(removeFlag);
})

function handleRemoval(ticket, id) {
    ticket.addEventListener("click", (e) => {
        if (removeFlag) {
            // ui removal
            ticket.remove();

            // db removal
            ticketsArr.forEach((ticketObj, idx) => {
                if (ticketObj.ticketId === id) ticketsArr.splice(idx, 1);
            });
            console.log(ticketsArr);
            localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
        }
    })
}

allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
        modalPriorityColor = colorElem.classList[0];
    })
})




// -------------------------------------   HandleLock Function    -----------------------------------------------

function handleLock(ticket, id) {
    let ticketLockElem = ticket.querySelector(".lock-icon-box");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".ticket-content");
    ticketLock.addEventListener("click", (e) => {
        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else {
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        // Modify data in local Storage -> TicketContent to be modified 
        let ticketIndex = getTicketIndex(id);
        console.log(ticketTaskArea.innerText);
        ticketsArr[ticketIndex].ticketContent = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
}

// -------------------------------------   HandleColor Function    -----------------------------------------------

function handleColor(ticket, id) {
    let ticketColorElem = ticket.querySelector(".ticket-color");
    ticketColorElem.addEventListener("click", (e) => {
        // get ticket color index from local storage
        let ticketIndex = getTicketIndex(id);

        let currentTicketColor = ticketColorElem.classList[1];
        // get current ticket color index
        let currentTicketColorIndex = colors.findIndex((color) => color === currentTicketColor);
        currentTicketColorIndex++;
        let newTicketColorIndex = currentTicketColorIndex % colors.length;
        let newTicketColor = colors[newTicketColorIndex];
        ticketColorElem.classList.remove(currentTicketColor);
        ticketColorElem.classList.add(newTicketColor);

        // modify data in local storage
        ticketsArr[ticketIndex].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
}

// -----------   getTicketIndex function ---------------------------

function getTicketIndex(id){
    let ticketIndex = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketId === id;
    })
    return ticketIndex;
}


// -------------------------------------------- ToolBox single click listner  ---------------------------------

for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click", (e) => {
        console.log("clicked here!");
        let currentToolBoxColor = toolBoxColors[i].classList[0];
        let filteredTickets = ticketsArr.filter((ticketObj, idx) => {
            return ticketObj.ticketColor === currentToolBoxColor;
        })

        //remove previous tickets
        let allTicketContainers = document.querySelectorAll(".ticket-box");
        for (let j = 0; j < allTicketContainers.length; j++) {
            allTicketContainers[j].remove();
        }

        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketContent, ticketObj.ticketId);
        })
    })
}

// -------------------------------------------- ToolBox double click listner  ---------------------------------

for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("dblclick", (e) => {
        let allTicketContainers = document.querySelectorAll(".ticket-box");
        for (let j = 0; j < allTicketContainers.length; j++) {
            allTicketContainers[j].remove();
        }
        ticketsArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketContent, ticketObj.ticketId);
        })
    })
}

// ---------------------------   set create ticket modal to default ------------------------
function setModalToDefault() {
    modalBoxTextArea.value = "";
    addBtn.style.backgroundColor = "lightseagreen";
    addBtn.style.backgroundColor = "lightseagreen";
    addFlag = false;modalBox.style.display = "none";
    allPriorityColors.forEach((colorsElem, idx) => {
        if(!colorsElem.classList.contains("black")){
            colorsElem.classList.remove("border");
        }else{
            colorsElem.classList.add("border");
        }
    })
    modalPriorityColor = colors[colors.length-1];
}