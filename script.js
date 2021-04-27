
let text = "Lorem <|_____,ipsum,gypsum,opossum|> dolor sit <|____,amet,amon,amen|>, consectetur adipiscing elit. Phasellus scelerisque enim lacus, vel aliquet ex pretium in. Vivamus diam tortor, luctus at dolor in, porta molestie metus. Mauris in <|______,tempor,temporary,empire|> diam. Aenean ullamcorper, tellus quis finibus egestas, lacus odio lobortis diam, porttitor feugiat elit dolor vel justo. Integer lorem erat, porttitor ut dapibus in, iaculis eget dolor. Nunc ultricies tellus sed turpis mollis aliquam. Vestibulum rhoncus purus sem, a tincidunt <|______,sapien,serpent,&%^%$^|> convallis ac. Sed tincidunt vel lectus sed auctor. In erat nunc, tincidunt et libero rutrum, pulvinar hendrerit diam. Curabitur imperdiet dui est, at venenatis nibh condimentum at. Duis ut rutrum nibh. Fusce vitae eros non orci aliquet consectetur at id risus. Nam venenatis ultricies elit, quis vehicula massa fermentum sit amet. Quisque sollicitudin accumsan mauris in ultrices. Vivamus id neque ex. Sed ut orci leo.";

const textarea = document.querySelector('.text-container');
const editButton = document.querySelector("#edit");
const submitButton = document.querySelector("#submit");
const status = document.querySelector(".status");
const number = document.querySelector(".number");
const modal = document.querySelector(".modal-background");
const modalContainer = document.querySelector(".modal-container");
const userText = document.querySelector(".user-text");
const saveButton = document.querySelector("#modal-save");
const cancelButton = document.querySelector("#modal-cancel");

const handleSubmit = (e) => {
  e.preventDefault();
  const selectNodes = document.getElementsByTagName('select');
  const selectNodesArray = Object.values(selectNodes);
  // check for text or word lists presence
  if (!text || !selectNodesArray.length){
    status.innerHTML = "<p>Press EDIT to add word lists.</p>";
    return;
  }
  let count = 0;
  let number = 0;
  let result = [];
  // create word lists
  const wordlists = parseText(text);
  // check if all the word lists are filled
  selectNodesArray.forEach((word, index) => {
    if(word.value !== '0') {
      count++;
      result[index] = word.value;
    }
  });
  // convert the string with word indeces to base64
  number = btoa(result.toString());
  // if everything is filled in update the status with the base64 string
  if(count === selectNodesArray.length){
    status.innerHTML = `<p>Copy this text:</p><p style="color: red">${number}</p>`;
  } else {
    let left = selectNodesArray.length - count;
    status.innerHTML = `<p><span style="color:green">${left}</span> ${left <=1 ? "field" : "fields"} remaining.</p>`;
  }
};

// show the EDIT window and copy current TEXT into it
const handleEdit = (e) => {
  e.preventDefault();
  userText.value = text;
  modal.style.display = "grid";
  saveButton.addEventListener("click", handleSave);
  cancelButton.addEventListener("click", handleCancel);
  modal.addEventListener("click", handleClose);
};

// reset main TEXT and STATUS areas
// build new TEXT area contents and close the EDIT window
const handleSave = (e) => {
  e.preventDefault();
  textarea.innerHTML = null;
  status.innerHTML = null;
  text = userText.value;
  insertElements(parseText(text));
  handleCancel(e);
};

// hide the EDIT window
const handleCancel = (e) => {
  e.preventDefault();
  modal.style.display = "none";
  saveButton.removeEventListener("click", handleSave);
  cancelButton.removeEventListener("click", handleCancel);
  modal.removeEventListener("click", handleClose);
};

// hide the EDIT window on background click
const handleClose = (e) => {
  e.preventDefault();
  if(e.target === modal) {
    handleCancel(e);
  }
};

// find flagged word sequences
// return an object with LISTs of strings and their START and END indeces 
const parseText = (txt) => {
  let i = 0;
  let j = 0;
  let count = 0;
  let list = [];
  const wordlists = [];

  // find the flags and set start and end indeces for wordlists
  while (txt[i]) {
    // find start flag "<|"
    if ((txt[i] === '<') && (txt[i + 1] === '|')) {
      i += 2;
      j = i;
      wordlists[count] = { start: i };
    }
    // find end flag "|>"
    else if ((txt[i] === '|') && (txt[i + 1] === '>')) {
      wordlists[count].end = i;
      // create a list of words
      wordlists[count].list = txt.substring(j, i).split(',');
      // offset indexes to include the flags
      wordlists[count].start = j - 2;
      wordlists[count].end = i + 2;
      count++;
    }
    i++;
  }
  return wordlists;
};

// build a sequence of strings (textNodes) and dropdowns (select)
// append resulting HTML to the main TEXT area
const insertElements= (wordlists) => {
  let start = 0;
  let end = 0;
  let str = "";
  let option;
  let select;
  let textNode;
  // create and join textNodes and Select elements
  Object.values(wordlists).map((entry) => {
    // assign start index of Select element to the end index of the textNode 
    end = entry.start;
    // extract the portion of the text before the Select element and append it
    str = text.slice(start, end);
    textNode = document.createTextNode(str);
    textarea.appendChild(textNode);
    // create a dropdown menu for a wordlist
    wrapper = document.createElement("div");
    select = document.createElement("select");
    wrapper.classList.add("wordlist-wrapper");
    select.classList.add("wordlist");
    // append each word as an option for the wordlist
    entry.list.forEach((word, index) => {
      option = document.createElement("option");
      option.setAttribute("value", index);
      option.innerText = word;
      select.appendChild(option);
    });
    wrapper.appendChild(select);
    textarea.appendChild(wrapper);
    // end index of Select element as a start index of a textNode
    start = entry.end;
  });
  // append the final portion of the text
  end = text.length;
  str = text.slice(start, end);
  textNode = document.createTextNode(str);
  textarea.appendChild(textNode);
};

editButton.addEventListener("click", handleEdit);
submitButton.addEventListener("click", handleSubmit);

// cleanup
window.onunload = (e) => {
  submitButton.removeEventListener("click", handleSubmit);
  editButton.removeEventListener("click", handleEdit);
};


