$("#option").on("click", function() {
    $("#options").toggleClass("active");
});

$("#options input[type='checkbox']").on("change", function() {
    var target = $(event.target);

    if(!target.is("label"))
        target = target.closest('label');

    target.toggleClass("active");
});