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

$("#options .chkall").on('change', function(){
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

$("#options .chkelem").on('change', function(){
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

$("#options .chkone").click(function(){
   $(".chkone").prop("checked",false);
   $(this).prop("checked",true);
});

$("#options input[type='checkbox']").on("change", function() {
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
