$(document).ready(function(){
    url = window.location.href.split("/");
    selected = url.pop();
    selected = url.pop();
    $(".course .chkone").each(function(){
        if($(this).val()===selected){
            var group = "input:checkbox[name='"+$(this).attr("name")+"']";
            $(group).prop("checked",false);
            $(this).prop("checked",true);
        }
    });

    $("span.score").hide();
    $("span.score.ALL").show();

});

$(".professor[type='checkbox']").click(function(){
    var group = "span.score."+$(this).attr("name");
    $(group).hide();
    $(group+"."+$(this).attr("value")).show();

});
