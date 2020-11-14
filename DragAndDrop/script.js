const addButtons = document.querySelectorAll(".add-btn:not(.solid)");
const saveItemsButtons = document.querySelectorAll(".solid");
const addItems = document.querySelectorAll(".add-container");

// Items list
const itemColumnsElemArray = document.querySelectorAll(".drag-item-list");
const backlogList = document.getElementById("backlog-list");
const progressList = document.getElementById("progress-list");
const completeList = document.getElementById("complete-list");
const holdList = document.getElementById("hold-list");

// drag item list mapper
let dragItemListMapper = {};

// Items
let draggedElement;
let originListId;

// Initialize arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let holdListArray = [];
let listArray = [];

// Get arrays from local storage if exists or initialize them
function getSavedColumns() {
  if (localStorage.getItem("backlogItems")) {
    backlogListArray = JSON.parse(localStorage.getItem("backlogItems"));
    progressListArray = JSON.parse(localStorage.getItem("progressItems"));
    completeListArray = JSON.parse(localStorage.getItem("completeItems"));
    holdListArray = JSON.parse(localStorage.getItem("onHoldItems"));
  } else {
    backlogListArray = ["Sleep", "Grab coffee", "Eat"];
    progressListArray = ["Code", "Learn"];
    completeListArray = ["Clean house"];
    holdListArray = ["Car insurance", "Planning Holidays"];
  }
  listArray = [
    backlogListArray,
    progressListArray,
    completeListArray,
    holdListArray,
  ];
}

function updateSavedColumnsToLocalStorage(columnId) {
  let arrayNames = ["backlog", "progress", "complete", "onHold"];

  if (columnId && arrayNames[columnId]) {
    localStorage.setItem(
      `${arrayNames[columnId]}Items`,
      JSON.stringify(listArray[columnId])
    );
  } else {
    arrayNames.forEach((name, idx) => {
      localStorage.setItem(`${name}Items`, JSON.stringify(listArray[idx]));
    });
  }
}

function createItemElement(parentElem, content, index) {
  const itemInfo = document.createElement("div");
  itemInfo.textContent = content;
  itemInfo.style.outline = "none";

  const editIcon = document.createElement("i");
  editIcon.classList.add("fas");
  editIcon.classList.add("fa-pencil-alt");
  editIcon.classList.add("edit-icon");

  const editIconContainer = document.createElement("div");
  editIconContainer.classList.add("edit-icon-container");
  editIconContainer.classList.add("hide");
  editIconContainer.appendChild(editIcon);
  editIconContainer.addEventListener("click", itemEditableMode);

  const itemContainer = document.createElement("li");
  itemContainer.classList.add("drag-item");
  itemContainer.draggable = true;
  itemContainer.setAttribute("ondragstart", "onDragStartHandler(event)");
  itemContainer.addEventListener("focusout", updateTaskItem);
  itemContainer.addEventListener("mouseenter", showEditIcon);
  itemContainer.addEventListener("mouseleave", hideEditIcon);
  itemContainer.id = index;

  itemContainer.appendChild(itemInfo);
  itemContainer.appendChild(editIconContainer);

  parentElem.appendChild(itemContainer);
}

function itemEditableMode(e) {
  const editContainer = e.target.parentElement;
  const itemElem = e.target.parentElement.parentElement.children[0];

  e.target.parentElement.parentElement.classList.add("edit-item");

  editContainer.classList.add("hide");
  itemElem.contentEditable = true;
  itemElem.focus();
  const content = itemElem.textContent;
  itemElem.textContent = "";
  itemElem.textContent = content;
  console.log(itemElem);
}

function showEditIcon(e) {
  e.target.children[1].classList.remove("hide");
}

function hideEditIcon(e) {
  e.target.children[1].classList.add("hide");
}

function updateTaskItem(e) {
  const itemTextElem = e.target;
  const textItemContent = itemTextElem.textContent;
  const itemIndex = e.target.parentElement.id;
  const columnElem = e.target.parentElement.parentElement;
  const itemListColumnId = columnElem.id;

  const columnId = dragItemListMapper[itemListColumnId];

  itemTextElem.contentEditable = "inherit";
  e.target.parentElement.classList.remove("edit-item");

  if (textItemContent.trim().length === 0) {
    listArray[columnId] = removeItemFromArray(itemIndex, listArray[columnId]);
  } else {
    listArray[columnId] = updateItemInArray(
      itemIndex,
      textItemContent,
      listArray[columnId]
    );
  }
  updateItemsColumnInDOMFromList(columnElem, listArray[columnId]);
  updateSavedColumnsToLocalStorage(columnId);
}

function removeItemFromArray(id, array) {
  const newArray = array.filter((item, idx) => {
    return idx !== +id;
  });
  return newArray;
}

function updateItemInArray(id, content, array) {
  const newArray = [...array];
  newArray[id] = content;
  return newArray;
}

function setContentEditable(e) {
  e.target.classList.add("edit-item");
}

function updateItemsColumnInDOMFromList(columnElem, itemsArray) {
  if (itemsArray) {
    columnElem.textContent = "";
    itemsArray.forEach((item, idx) => createItemElement(columnElem, item, idx));
  }
}

function initializeDOM() {
  // mapper drag items columns
  dragItemListMapper = itemListMapper(itemColumnsElemArray);
  // initialize items || get it from localstorage
  getSavedColumns();

  // Add items to DOM
  itemColumnsElemArray.forEach((columnElem, idx) =>
    updateItemsColumnInDOMFromList(columnElem, listArray[idx])
  );
}

initializeDOM();

// Events
// onDragStart
function onDragStartHandler(e) {
  draggedElement = e.target;
  originListId = draggedElement.parentElement.id;
}
// onDragOver
function dragOver(e) {
  e.preventDefault();
}

// onDragEnter
function dragEnter(e, columnNbr) {
  e.preventDefault();
  currentItemsColumn = columnNbr;
  itemColumnsElemArray[columnNbr].classList.add("over");
}

function dragLeave(e, columnNbr) {
  e.preventDefault();
  console.log("ondragLeave:: columnNUmber", columnNbr);
  itemColumnsElemArray[columnNbr].classList.remove("over");
}

//drop
function onDropHandler(event) {
  // remove the over effect
  itemColumnsElemArray.forEach((elem, idx) => {
    itemColumnsElemArray[idx].classList.remove("over");
  });

  // add element to the new ul
  const parentElem = itemColumnsElemArray[currentItemsColumn].appendChild(
    draggedElement
  );

  // update origin and destiny arrays
  console.log("event.target.parentElement.id", event.target.parentElement.id);
  const originColumnIdx = dragItemListMapper[originListId];
  const destinyColumnIdx = dragItemListMapper[parentElem.parentElement.id];

  listArray[originColumnIdx] = updateItemsListArray(
    itemColumnsElemArray[originColumnIdx]
  );
  listArray[destinyColumnIdx] = updateItemsListArray(
    itemColumnsElemArray[destinyColumnIdx]
  );

  // save on localstorage
  updateSavedColumnsToLocalStorage();
}

// onClick
function showAddItemContainer(column) {
  addButtons[column].style.visibility = "hidden";
  saveItemsButtons[column].style.display = "flex";
  addItems[column].style.display = "flex";
}

function hideAddItemContainer(column) {
  console.log("hideAddItemContainer");
  addButtons[column].style.visibility = "visible";
  saveItemsButtons[column].style.display = "none";
  addItems[column].style.display = "none";
  addNewItemToTaskArray(column);
  updateSavedColumnsToLocalStorage();
  updateDOMListColumnFromTaskArray(
    listArray[column],
    itemColumnsElemArray[column]
  );
}

function addNewItemToTaskArray(column) {
  const addItem = addItems[column].children[0];
  const addItemValue = addItem.textContent.trim();

  if (addItemValue.length > 0) {
    listArray[column].push(addItemValue);
  }

  addItem.textContent = "";
}

// utils
function updateItemsListArray(itemsColumnElement) {
  const newArray = [];
  if (itemsColumnElement && itemsColumnElement.children) {
    for (let i = 0; i < itemsColumnElement.children.length; i++) {
      newArray.push(itemsColumnElement.children[i].textContent);
    }
  }
  return newArray;
}

function updateDOMListColumnFromTaskArray(tasks, parentElem) {
  if (tasks && tasks.length > 0) {
    parentElem.textContent = "";
    tasks.forEach((task, idx) => createItemElement(parentElem, task, idx));
  }
}

function itemListMapper(listItemColumns) {
  const itemListMapper = {};
  if (listItemColumns) {
    // mapper drag items columns
    listItemColumns.forEach((column, idx) => {
      itemListMapper[column.id] = idx;
      itemListMapper[idx] = column.id;
    });
  }
  return itemListMapper;
}
