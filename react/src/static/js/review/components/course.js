$(document).ready(function(){
    $(".professor").each(function(){
        $(this).prop("checked",true);
    });
});

$(".course").click(function(){
    course_id = $(this).find("input[name='course_id']").attr('value');
    window.location = "/review/result/course/"+course_id;
});
