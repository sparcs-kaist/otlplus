$(document).ready(function(){
    $(".professors input[type='checkbox']").each(function(){
        $(this).on("change", function() {
            target = $(this).closest('label');
            $(target).toggleClass("active");
        });
    });
});