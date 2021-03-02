const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.topnav_menu');
const links = document.querySelectorAll('.nav-links-item');

let changeIcon = false;

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle("open");
    links.forEach(link =>{
        link.classList.toggle('fade');
    })

    if (!changeIcon){
        hamburger.classList.add("close");
        changeIcon = true;
    }
    else{
        hamburger.classList.remove("close");
        changeIcon = false;
    }
});