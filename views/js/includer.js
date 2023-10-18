$(function(){
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
})