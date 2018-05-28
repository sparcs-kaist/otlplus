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

$('.login').click(function() {
    location.href = "/session/login/?next="+location.href;
});
$('.logout').click(function() {
    location.href = "/session/logout/?next="+location.href;
});

$('#unregister').click(function() {
    if (confirm("정말로 OTL+ 서비스를 SSO 계정에서 해지하시겠습니까?\n\n" +
            "* 주의: SPARCS SSO는 회원 탈퇴 되지 않고 그대로 유지됩니다.\n*" +
            " 재등록을 위해서는 같은 SSO 아이디로 OTL+ 로그인을 시도하시면 됩니다.\n*"+
            " 탈퇴 후 60일이 지나야 OTL+ 재등록이 가능합니다.")) {
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
