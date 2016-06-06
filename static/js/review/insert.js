$("#"+window.location.href.split("/insert/")[1].split("/")[1]).each(function(){
        $(this).removeClass("deactive");
});

$("#l"+window.location.href.split("/insert/")[1].split("/")[0]).each(function(){
        $(this).removeClass("deactive");
        $(this).removeClass("written");
});



