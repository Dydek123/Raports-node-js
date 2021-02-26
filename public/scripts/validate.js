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

const form = document.querySelector("form");
const detailsInput = form.querySelector('input[name="name"]');
const emailInput = form.querySelector('input[name="email"]');
const confirmedPasswordInput = form.querySelector('input[name="repeat-password"]');

function isEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function isNameAndSurname(value){
    return /\S+\040+\S+/.test(value)
}

function arePasswordsSame(password, confirmedPassword) {
    return password === confirmedPassword;
}

function markValidation(element, condition) {
    let parent = element.parentNode.parentNode;
    !condition ? parent.classList.add('no-valid') : parent.classList.remove('no-valid');
    !condition ? parent.classList.remove('focus') : parent.classList.add('focus');
}

function validateEmail() {
    setTimeout(function () {
            markValidation(emailInput, isEmail(emailInput.value));
        },
        500
    );
}

function validatePassword() {
    setTimeout(function () {
            const condition = arePasswordsSame(
                form.querySelector('input[name="password"]').value,
                confirmedPasswordInput.value
            );
            markValidation(confirmedPasswordInput, condition);
        },
        500
    );
}

function validateName() {
    setTimeout(function () {
            markValidation(detailsInput, isNameAndSurname(detailsInput.value));
        },
        500
    );
}

inputs.forEach(input => {
    input.addEventListener("focus", addcl);
    input.addEventListener("blur", remcl);
});

emailInput.addEventListener('keyup', validateEmail);
confirmedPasswordInput.addEventListener('keyup', validatePassword);
detailsInput.addEventListener('keyup', validateName);