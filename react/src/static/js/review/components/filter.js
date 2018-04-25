$(document).ready(function(){
    now_url = window.location.href.split("&filter=")
    if(now_url.length>1){
        var filter_value = now_url.pop().split("&").shift();
        $("input[type='checkbox'][name='filter']").prop("checked",false);
        $("input[type='checkbox'][name='filter'][value="+filter_value+"]").prop("checked",true);
    }
    else{
        window.location.href=now_url+"?q=&filter=ALL"
    }

    $("input[type='checkbox']").each(function(){
      target = $(this);
      target = target.closest('label');
      if($(this).is(':checked')){
          target.addClass("active");
      }
      else{
          target.removeClass("active");
      }
    });


});

$("input[type='checkbox'][name='filter']").click(function(){
    var pre_url =  window.location.href.split("&");
    var url = pre_url.shift()
    url += "&filter=" + $(this).val()
    
    window.location.href=url;    
});


