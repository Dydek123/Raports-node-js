let category = window.location.href.split('/');
const navLink = document.querySelector('.nav__link');

category = category[category.length-2];
if (category === 'raports')
    category = 'Raporty'
if (category === 'documents')
    category = 'Dokumenty'

const getData = async () => {
    const data = await fetch('/content/uploadCategories');
    return data.json();
}

const createLink = (text) => {
    let paragraph = document.createElement('p');
    let span = document.createElement('span');
    let icon = document.createElement('i')
    paragraph.classList.add('collapse__link');
    icon.classList.add('fas');
    icon.classList.add('fa-caret-down');
    span.innerText = text;
    paragraph.appendChild(span);
    paragraph.appendChild(icon);
    navLink.appendChild(paragraph)
}

const createListElement = (list, title) => {
    const link = document.createElement('a');
    link.href = `/content/raports/${title}`;
    link.classList.add('collapse__sublink');
    link.innerText = title;
    list.appendChild(link);
}

const createList = (element) => {
    const ulList = document.createElement('ul');
    ulList.classList.add('collapse__menu');
    navLink.appendChild(ulList);
    return ulList;
}

// COLLAPSE MENU RAPORTS
const linkCollapse = document.getElementsByClassName('collapse__link')
const buttonCollapse = document.getElementsByClassName('nav__link')
let i;

const rotateArros = (arrow) => {
    arrow.classList.toggle('rotate');
}
const collapseMenu = () =>{
    for(i=0;i<linkCollapse.length;i++){
        linkCollapse[i].addEventListener('click', function(){
            const collapseMenu = this.nextElementSibling;
            collapseMenu.classList.toggle('showCollapse');
            const rotateDiv = collapseMenu.previousElementSibling;
            const rotateElement = rotateDiv.childNodes;
            rotateArros(rotateElement[1]);
            rotateElement[0].classList.toggle('bold');
        })
    }
}

const showAll = async type => {
    let existedTitle = [];
    let ulList;
    await getData()
        .then(data => {
            navLink.innerHTML = '' ;
            data.forEach(element => {
                if(element.category === type && !existedTitle.includes(element.title)){
                    createLink(element.title);
                    ulList = createList(element.document);
                    existedTitle.push(element.title)
                }
                createListElement(ulList, element.document)
            })
        })
    existedTitle.length = 0;
    collapseMenu();
}

const showFound = (list, searchValue) => {
    let existedTitle = [];
    let ulList;
    searchValue = searchValue.toLowerCase();
    navLink.innerHTML = '' ;
    for (const element of list) {
        let dbDocument = element.document.toLowerCase();
        let dbTitle = element.title.toLowerCase();
        if(dbDocument.includes(searchValue) || dbTitle.includes(searchValue)){
            createLink(element.title);
            ulList = createList(element.document);
            existedTitle.push(element.title);
        }
        createListElement(ulList, element.document)
    }
    existedTitle.length = 0;
    collapseMenu();
}

showAll(category);

const search = document.querySelector('input[placeholder="Szukaj..."]');
const searchIcon = document.querySelector('.fa-search');
searchIcon.addEventListener('click',  () =>{
    const data = search.value;
    if (data === '')
        showAll(category)
    else
        fetch(`/content/uploadCategories/${data}`)
            .then(response => response.json())
            .then(docs => showFound(docs, data))
})

search.addEventListener('keyup',  (event) =>{
    if (event.key === "Enter") {
        event.preventDefault();
        const data = search.value;
        if (data === '')
            showAll(category)
        else
            fetch(`/content/uploadCategories/${data}`)
                .then(response => response.json())
                .then(docs => showFound(docs, data))
    }
})


const sidebarButton = document.querySelector('.sidemenu');
const menu = document.querySelector('.menu');
const content = document.querySelector('.documentation-text');

sidebarButton.addEventListener('click', () => {
    menu.classList.toggle("show");
    content.classList.toggle("hide");
    sidebarButton.classList.toggle("change");
});

// Add New Comment auto resize textarea
function getScrollHeight(elm){
    let savedValue = elm.value
    elm.value = ''
    elm._baseScrollHeight = elm.scrollHeight
    elm.value = savedValue
}

function onExpandableTextareaInput({ target:elm }){
    // make sure the input event originated from a textarea and it's desired to be auto-expandable
    if( !elm.classList.contains('autoExpand')) return

    let minRows = elm.getAttribute('data-min-rows')|0, rows;
    !elm._baseScrollHeight && getScrollHeight(elm)
    elm.rows = minRows
    rows = Math.ceil((elm.scrollHeight - elm._baseScrollHeight) / 18)
    elm.rows = minRows + rows
}

// global delegated event listener
// document.addEventListener('input', onExpandableTextareaInput)

//Add action path to new comment form
const addCommentForm = document.querySelector('.new-comment')
const addPathToAction = (oldForm, extraPath) => {
    oldForm.action = window.location.pathname + extraPath;
}

const updateForm = (form, path) => {
    form.forEach(button => {
        button.addEventListener('click', () => {
            addPathToAction(button.closest('form'), path)
        })
    })
}

addCommentForm.addEventListener('submit', () => {
    addPathToAction(addCommentForm, '/newComment')
})

//Add action path to delete version button
const deleteVersionButton = document.querySelectorAll('button[name="version"]');
updateForm(deleteVersionButton, '/deleteVersion');

//Add action path to delete comment button
const deleteCommentButton = document.querySelectorAll('button[name="commentDelete"]');
updateForm(deleteCommentButton, '/deleteComment');

function setHeight(element) {
    element.style.height = ""; /* Reset the height*/
    element.style.height = element.scrollHeight + "px";
};
function autoHeight() {
    this.style.height = ""; /* Reset the height*/
    this.style.height = this.scrollHeight + "px";
};

//Add action path to update comment button
const updateCommentButton = document.querySelectorAll('button[name="commentUpdate"]');
updateCommentButton.forEach(button => {
    button.addEventListener('click', () => {
        console.log(button.closest('.one-comment').childNodes)
        const dbComment = button.closest('.one-comment').childNodes[3];
        const editComment = button.closest('.one-comment').childNodes[5];
        let commentText = dbComment.childNodes[0];
        dbComment.classList.toggle('invisible');
        editComment.classList.toggle('showFlex');
        editComment.childNodes[1].value = commentText.textContent;
        addPathToAction(editComment.childNodes[1].closest('form'), '/updateComment');
        setHeight(editComment.childNodes[1])
    })
})

//READ DOCX
const docxText = document.querySelector('.documentation-docx');
let tmp = docxText.innerText;
docxText.innerHTML = tmp;
docxText.style.display = 'block';

let docxImages = docxText.querySelectorAll('img');
docxImages.forEach(docxImg => {
    docxImg.addEventListener('click', () => {
        docxImg.closest('p').classList.toggle('lightbox');
        docxImg.classList.toggle('zoomImg')
    })
})

