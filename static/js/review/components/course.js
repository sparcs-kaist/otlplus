$(document).ready(function(){
    $(".professor").each(function(){
        $(this).prop("checked",true);
    });

    $("span.score").hide();
    $("span.score.ALL").show();

});

$(".course").click(function(){
    course_id = $(this).find("input[name='course_id']").attr('value');
    window.location = "/review/result/course/"+course_id;
});
