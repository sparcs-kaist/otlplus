$(document).ready(function(){
    now_url = window.location.href.split("&sort=")
    if(now_url.length>1){
        var sort_value = now_url.pop().split("&").shift();
        $("input[type='checkbox'][name='sort']").prop("checked",false);
        $("input[type='checkbox'][name='sort'][value="+sort_value+"]").prop("checked",true);
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

    $("input[type='radio']").each(function(){
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

$(".chkall").on('change', function(){
    name = this.name;
    if($(this).is(':checked')){
        $(".chkelem").each(function(){
            if(this.name==name){
                $(this).prop("checked",false);
            }
            
        });
    }
    else {
        $(this).prop("checked",true);
        
    }
});

$(".chkelem").on('change', function(){
    name = this.name;
    count = 0
    $(".chkelem").each(function(){
        if(this.name==name && !$(this).is(':checked')) count +=1;
    });

    
    $(".chkall").each(function(){
        if(this.name==name){
            if(count==0){
                $(this).prop("checked",true);
                $(".chkelem").each(function(){
                    if(this.name==name){
                        $(this).prop("checked",false);
                    }
                });
            }
            else $(this).prop("checked",false);
        }
    });
});

$(".chkone").click(function(){
    var group = "input:checkbox[name='"+$(this).attr("name")+"']";
   $(group).prop("checked",false);
   $(this).prop("checked",true);
});

$(document).scroll(function() {
    $("input[type='checkbox']").each(function(){
      target = $(this);
      target = target.closest('label');
      if($(this).is(':checked')){
          target.addClass("active");
      }
      else{
          target.removeClass("active");
      }


    })
});


$(document).on("change", function() {
    $("input[type='checkbox']").each(function(){
      target = $(this);
      target = target.closest('label');
      if($(this).is(':checked')){
          target.addClass("active");
      }
      else{
          target.removeClass("active");
      }


    })
});

$("form.navbar-form").submit(function(){
    var form = $(this);
    $("#options input").each(function(){
        if ($(this).is(":checked"))
        {
            name = $(this).attr("name");
            value = $(this).attr("value");
            $("<input>").attr("type","hidden").attr("name",name).attr("value",value).appendTo(form);
        }
    })
});


$("input[type='checkbox'][name='sort']").click(function(){
    var pre_url =  window.location.href.split("&");
    var url = pre_url.shift()
    limit = pre_url.length
    for(i=0;i<limit;i++){
        temp = pre_url.shift()
        if(temp.substring(0,4)!="sort"){
            url += "&" + temp
        }    
    }
    url += "&sort=" + $(this).val()
    
    window.location=url;    
});


