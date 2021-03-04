const subcategories = document.querySelector('select[name="documentType"]');
const categories = document.querySelector('select[name="category"]');
const documentName = document.querySelector('select[name="documentName"]');

const getData = async () => {
    const data = await fetch('uploadCategories');
    return data.json();

}
const jsonContent = getData();

const cleanNext = (node, text) => {
    node.parentNode.classList.remove('hidden-input');
    node.innerHTML = '';
    let option = document.createElement('option');
    option.setAttribute('value', '')
    option.selected = true;
    option.disabled = true;
    option.innerText = text;
    node.appendChild(option)
}

const newDocumentOption = (node) => {
    let option = document.createElement('option');
    option.setAttribute('value', 'new')
    option.innerText = 'Stwórz nowy dokument';
    node.appendChild(option)
}

categories.addEventListener('change', () => {
    let existedSubcategories = [];
    cleanNext(subcategories, 'Wybierz podkategorie');
    documentName.parentNode.classList.add('hidden-input');
    jsonContent.then(data => {
        data.forEach(element => {
            if(element.category === categories.value && !existedSubcategories.includes(element.title)) {
                let newOption = document.createElement('option');
                newOption.setAttribute('value', element.title)
                newOption.innerText = element.title;
                subcategories.appendChild(newOption)
                existedSubcategories.push(element.title)
            }
        })
    })
    existedSubcategories.length = 0;
})

subcategories.addEventListener('change', () => {
    cleanNext(documentName, 'Wybierz dokument');
    jsonContent.then(data => {
        data.forEach(element => {
            console.log(element.document)
            console.log(subcategories.value)
            if(element.title === subcategories.value) {
                let newOption = document.createElement('option');
                newOption.setAttribute('value', element.document)
                newOption.innerText = element.document;
                documentName.appendChild(newOption)
            }
        })
    })
    newDocumentOption(documentName)
})