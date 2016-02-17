$("#option").on("click", function() {
    $("#option").toggleClass("active");
    $('#options').toggleClass("active");
});

$(".course .panel-title").on("click", function(){
  course_id = $(this).parent().find("input[type='hidden']").val();
  $("input:checkbox[name="+course_id+"]").each(function(){
    if(this.checked){
        professor_id = this.value;
    };
  });
  var url = "/review/result/course/" + course_id +"/" + professor_id;
  window.location=url;
});
