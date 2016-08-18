$(".review .lecture").click(function(){
    if(window.location.href.split("/").length < 5 || window.location.href.split("/")[5] != "course"  ){
        course_id = $(".lecture input[name='"+$(this).attr('id')+"']").attr("value");
        window.location="/review/result/course/"+course_id;
    }
});

$(".review .comment").click(function(){
    if(window.location.href.split("/").length < 5 || window.location.href.split("/")[5] != "comment"  ){
        comment_id = $(".comment input[name='"+$(this).attr('id')+"']").attr("value");
        window.location="/review/result/comment/"+comment_id;
    }
});
$(".review .like-button").click(function(){
    $.ajax({
        type: "POST",
        url: "/review/like/",
        data: {'commentid': $(this).attr('id'), 'csrfmiddlewaretoken': $("#csrf_token").val()},
        dataType:'json',
        success: function(response) {
            data = JSON.parse(response);
            if(!data.is_login)
                alert("로그인이 필요합니다");
            else{
                if(data.already_up){
                }
                else{
					//alert(JSON.stringify(data.id).replace(/\"/g,""))
                    target = "."+JSON.stringify(data.id).replace(/\"/g,"")+".like_num";
                    $(target).text(data.likes_count);
                    target = "a."+JSON.stringify(data.id).replace(/\"/g,"");
                    $(target).addClass("not-active declaration-button");
                    $(target).removeClass("like-button");
					target = "i."+JSON.stringify(data.id).replace(/\"/g,"");
					$(target).addClass("fa-check");
					$(target).removeClass("fa-thumbs-up");
                }
            }
        },
        error: function(rs, e) {
            alert("error");
               alert(rs.responseText);
        }
    });
});
