$(".review .lecture").click(function(){
    course_id = $(".lecture input[name='"+$(this).attr('id')+"']").attr("value");
    window.location="/review/result/course/"+course_id;
});

$(".review .comment").click(function(){
    comment_id = $(".comment input[name='"+$(this).attr('id')+"']").attr("value");
    window.location="/review/result/comment/"+comment_id;
});
