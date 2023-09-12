$(function () {
    // window.scrollTo(0,0);

    var includes = $('[data-include]')
    $.each(includes, function () {
        var file = '/views/html/' + $(this).data('include') + '.html';
        let loaded = $(this).load(file, function () {
            let parent = loaded[0];
            Array.from(parent.querySelectorAll('.str-replaceable')).forEach(replaceable => {
                let targetReplace = replaceable.getAttribute('data-target-replace');
                let parentReplacer = parent.getAttribute(`data-replace-${targetReplace}`);

                replaceable.classList.remove('str-replaceable');
                replaceable.removeAttribute('data-target-replace', '');

                // parent.setAttribute(`data-replace-${targetReplace}`, '')
                if (parentReplacer[0] == '%') {
                    parentReplacer = eval(parentReplacer.replaceAll('%', ''));
                }
                replaceable.innerHTML = parentReplacer;
            });
        });

    })


    // sticky
    const observer = new IntersectionObserver(function([e]){
        e.target.classList.toggle('stick-transparent-bg', e.intersectionRatio < 1);
    }, {
        rootMargin: '-75px 0px 0px 0px',
        threshold: [1],
    });
    Array.from(document.querySelectorAll('.stick-transparent-bg')).forEach(sticky => {
        observer.observe(sticky);
    });
})

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
