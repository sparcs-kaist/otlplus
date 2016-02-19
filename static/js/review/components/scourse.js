$(document).ready(function(){
    url = window.location.href.split("/");
    url.pop();
    professor_id = url.pop();
    course_id = url.pop();
    $(".course .chkone").each(function(){
        if($(this).val()===professor_id){
            var group = "input:checkbox[name='"+course_id+"']";
            $(group).prop("checked",false);
            $(this).prop("checked",true);
        }
    });

    var group = "span.score."+course_id;
    $(group).hide();
    $(group+"."+professor_id).show();

});
