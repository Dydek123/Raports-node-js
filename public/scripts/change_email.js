const emailInput = document.querySelector("input[name='email']");
if (emailInput.value !== ''){
    let parent = emailInput.parentNode.parentNode;
    parent.classList.add("focus");
}

