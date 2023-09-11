$(function () {
    var includes = $('[data-include]')
    $.each(includes, function () {
        var file = '/views/html/' + $(this).data('include') + '.html'
        $(this).load(file)
    })
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
