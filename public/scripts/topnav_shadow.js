window.onscroll = function(){
    scrollFunction();
}

function scrollFunction() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300){
        document.getElementById("main-topnav").style.backgroundColor =  'rgba(18,35,46,1)';
    } else {
        document.getElementById("main-topnav").style.background =  'linear-gradient(0deg, rgba(18,35,46,0.5) 0%, rgba(18,35,46,0.8) 52%)';
    }
}