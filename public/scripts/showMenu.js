let category = window.location.href.split('/');
const navLink = document.querySelector('.nav__link');

category = category[category.length-1];
if (category === 'raports')
    category = 'Raporty'
if (category === 'documents')
    category = 'Dokumenty'

const getData = async () => {
    const data = await fetch('uploadCategories');
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


