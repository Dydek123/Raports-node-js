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

// COLLAPSE MENU RAPORTS
const linkCollapse = document.getElementsByClassName('collapse__link')
const buttonCollapse = document.getElementsByClassName('nav__link')
var i

function collapseMenu(){
    for(i=0;i<linkCollapse.length;i++){
        linkCollapse[i].addEventListener('click', function(){
            const collapseMenu = this.nextElementSibling;
            collapseMenu.classList.toggle('showCollapse');

            const rotateDiv = collapseMenu.previousElementSibling;
            const rotateElement = rotateDiv.childNodes;
            rotateElement[3].classList.toggle('rotate');
            rotateElement[1].classList.toggle('bold');
        })
    }
}
collapseMenu();
