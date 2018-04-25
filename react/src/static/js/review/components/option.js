$(document).ready(function(){
    sort_a = window.location.href.split("&sort=")
    semester_a = window.location.href.split("&semester=")
    grade_a = window.location.href.split("&grade=")
    department_a = window.location.href.split("&department=")
    type = window.location.href.split("&type=")
    var check_checked_elm = function(str){
        check_exist = window.location.href.split("&"+str+"=")
        if(check_exist.length>1){
            check_exist.shift();
            elm_array = check_exist
            $("input[type='checkbox'][name='"+str+"']").prop("checked",false);
            if(elm_array.constructor===Array){
                for(i=0;i<elm_array.length;i++){
                   $("input[type='checkbox'][name='"+str+"'][value="+elm_array[i].split("&").shift()+"]").prop("checked",true);
                }
            }
            else{
                $("input[type='checkbox'][name='"+str+"'][value="+elm_array+"]").prop("checked",true);
            }
        }
    }

    check_checked_elm('sort');
    check_checked_elm('semester');
    check_checked_elm('grade');
    check_checked_elm('department');
    check_checked_elm('type');

    $('input,textarea').attr('autocomplete','off');

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
    count2 = 0
    $(".chkelem").each(function(){
        if(this.name==name && !$(this).is(':checked')) count +=1;
    });
    $(".chkelem").each(function(){
        if(this.name==name && $(this).is(':checked')) count2 +=1;
    });

    
    $(".chkall").each(function(){
        if(this.name==name){
            if(count==0 || count2==0){
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
    /*
    var group = "input:checkbox[name='"+$(this).attr("name")+"']";
   $(group).prop("checked",false);
   $(this).prop("checked",true);
   */
    name = this.name;
    temp = $(this)
    $(".chkone").each(function(){
        if(this.name==name){
            $(this).removeClass("active");
        }
    });
    temp.addClass("active");


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
    $("input[type='checkbox'], input[type='radio']").each(function(){
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


