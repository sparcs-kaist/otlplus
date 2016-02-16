$(document).ready(function(){
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
