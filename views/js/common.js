const API_ROUTE = 'https://api.omegarelectrice.com/';

$(function () {
    // sticky
    const observer = new IntersectionObserver(function ([e]) {
        e.target.classList.toggle('stick-transparent-bg', e.intersectionRatio < 1);
    }, {
        rootMargin: '-75px 0px 0px 0px',
        threshold: [1],
    });
    Array.from(document.querySelectorAll('.stick-transparent-bg')).forEach(sticky => {
        observer.observe(sticky);
    });

    // page load
    // document.body.removeAttribute('style');
    document.body.style.display = '';

    // footer
    loadEx('/views/html/footer.html', {
        position: 'end',
    });
});

function loadEx(path, config) {
    let placeholder = document.createElement('inc');

    document.body.appendChild(placeholder);

    // $(placeholder).load(path);
    $.get(path, function (data) {
        $(placeholder).replaceWith(data);
    });
}

let toast = function (type, title, msg) {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "0",
        "hideDuration": "1000",
        "timeOut": "2000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "rtl": true
    }
    toastr[type](title, msg);
}
