const mainCategorySelect = document.querySelector("select[name='category']");
const subcategorySelect = document.querySelector('.select-subcategory');
const template = document.querySelector('#select-option');

let uniqueCategoriesList = [];
function createSubcategories(subcategory) {
    if (!uniqueCategoriesList.includes(subcategory.title)){
        const clone = template.content.cloneNode(true);

        const optionButton = clone.querySelector("option");
        optionButton.value = subcategory.title;
        optionButton.innerHTML = subcategory.title;

        subcategorySelect.firstElementChild.appendChild(clone);
        uniqueCategoriesList.push(subcategory.title);
    }
}

function loadSubcategories(subcategories) {
    const template = document.querySelector('#label-option');
    const clone = template.content.cloneNode(true);
    uniqueCategoriesList = [];
    subcategorySelect.style.display = "flex";
    subcategorySelect.appendChild(clone);
    subcategories.forEach(subcategory => {
        createSubcategories(subcategory);
    })
}

let values = []

mainCategorySelect.addEventListener('change', function (event) {
   const data = {category: this.value};
   fetch("/subcategories",{
       method: "POST",
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify(data)
   }).then(function (response) {
       return response.json();
   }).then(function (subcategories){
       subcategorySelect.innerHTML = '';
       loadSubcategories(subcategories);
       values = [...subcategories];
   });
});


const documentsSelect = document.querySelector('.select-document');
function loadDocuments(documentValue) {
    if (documentValue.title === subcategorySelect.firstElementChild.value && documentValue.document) {
        const cloneDocuments = template.content.cloneNode(true);

        const optionButtonDocuments = cloneDocuments.querySelector("option");

        optionButtonDocuments.value = documentValue.document;
        optionButtonDocuments.innerHTML = documentValue.document;

        documentsSelect.firstElementChild.appendChild(cloneDocuments);
    }
}

subcategorySelect.addEventListener('change', function (event){
    documentsSelect.firstElementChild.innerHTML = '';
    const disabledTemplate = document.querySelector('#disabled-option');
    const cloneDisabled = disabledTemplate.content.cloneNode(true);
    documentsSelect.firstElementChild.appendChild(cloneDisabled);

    values.forEach(documentValue => {
        loadDocuments(documentValue);
    });

    const newTemplate = document.querySelector('#new-option');
    const cloneNew = newTemplate.content.cloneNode(true);
    documentsSelect.firstElementChild.appendChild(cloneNew);
});