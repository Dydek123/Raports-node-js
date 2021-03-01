const inputs = document.querySelectorAll(".input");
const selects = document.querySelectorAll('#slct');

function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}

function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}


inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});

selects.forEach(select => {
	select.addEventListener('change', function () {
		this.style.color = "var(--medium-blue)";
		this.parentNode.style.borderBottom  = "2px solid var(--light-blue)";
	})
})

const content = document.querySelector('.slct-content')
const showTitle = () => {
	const titleInputParent = document.querySelector("input[name=title]").parentNode.parentNode;
	const titleInput = document.querySelector("input[name=title]");
	const publicInputParent = document.querySelector("select[name=isPublic]").parentNode;
	const publicInput = document.querySelector("select[name=isPublic]");
	if (content.value === 'new'){
		titleInputParent.classList.remove('hidden-input');
		publicInputParent.classList.remove('hidden-input');
		titleInput.required  = true;
		publicInput.required  = true;
	} else {
		titleInputParent.classList.add('hidden-input');
		publicInputParent.classList.add('hidden-input');
		titleInput.required  = false;
		publicInput.required  = false;
	}
}
content.addEventListener('change', showTitle)


// for (let i = 0 ; i < selects.length -1 ; i++){
// 	selects[i].addEventListener('change', () => {
// 		selects[i+1].classList.remove('hidden');
// 	})
// }

// Content
function showDocumentsType(){
	const newDocument = document.querySelector(".select-subcategory");
	newDocument.style.display = "flex";
}

function checkNew(){
	const val = document.querySelectorAll(".slct-content");
	const newInput = document.querySelector(".new-input");
	const publicInput = document.querySelector('.public-select');

	if (val[0].value === "new"){
		newInput.style.display = "block";
		publicInput.style.display = "flex";
	}

	else{
		newInput.style.display = "none";
		publicInput.style.display = "none";
	}
}