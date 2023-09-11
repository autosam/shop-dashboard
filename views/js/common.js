$(function () {
    var includes = $('[data-include]')
    $.each(includes, function () {
        var file = '/views/html/' + $(this).data('include') + '.html';
        let loaded = $(this).load(file, function(){
            let parent = loaded[0];
            Array.from(parent.querySelectorAll('.str-replaceable')).forEach(replaceable => {
                let targetReplace = replaceable.getAttribute('data-target-replace');
                let parentReplacer = parent.getAttribute(`data-replace-${targetReplace}`);

                replaceable.classList.remove('str-replaceable');
                replaceable.removeAttribute('data-target-replace', '');

                parent.setAttribute(`data-replace-${targetReplace}`, '')
                if(parentReplacer[0] == '%'){
                    parentReplacer = eval(parentReplacer.replaceAll('%', ''));
                }
                replaceable.innerHTML = parentReplacer;
            });
        });
        
    })

    console.log(document.querySelectorAll('.str-replaceable'));
    // word replace
    Array.from(document.querySelectorAll('.str-replaceable')).forEach(replaceable => {
        let targetReplace = replaceable.getAttribute('data-target-replace');
        console.log(targetReplace);
    });
})

let toast = function(type, title, msg){
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
