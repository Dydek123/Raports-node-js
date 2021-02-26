const inputs = document.querySelectorAll(".input");


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

function changeMe(sel){
	sel.style.color = "var(--medium-blue)";
	sel.parentNode.style.borderBottom  = "2px solid var(--light-blue)";
}

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