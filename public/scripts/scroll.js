document.querySelector(function() {
    document.querySelector('#main-scroll').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('html, body').animate({ scrollTop: document.querySelector(document.querySelector(this).attr('href')).offset().top}, 500, 'linear');
    });
});