function checkScroll(){
    var startY = $('.navbar').height() * 2; //The point where the navbar changes in px

    if($(window).scrollTop() > startY){
        $('.navbar').addClass("scrolled");
    }else{
        $('.navbar').removeClass("scrolled");
    }
}

if($('.navbar').length > 0){
    $(window).on("scroll load resize", function(){
        checkScroll();
    });
}

$('#unregister').click(function() {
    if (confirm("정말로 OTLPLUS에서 탈퇴하시겠습니까?\n\n" +
            "* SPARCS SSO는 회원 탈퇴 되지 않습니다.\n*" +
            " 탈퇴 후 60일이 지나야 재가입이 가능합니다.")) {
        $.ajax({
            'method' : 'POST',
            'url' : '/session/unregister/',
            'dataType' : 'json',
            'beforeSend' : function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrf_token);
            },
            'success' : function(data, jqXHR) {
                location.href = "/main/";
            },
            'error' : function(jqXHR, textStatus, error) {
                alert(error);
            },
        });
    }
});