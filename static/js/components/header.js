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

$('.logout').click(function(){
    logoutWindow = window.open("https://sparcssso.kaist.ac.kr/account/logout/","logoutWindow","width=1, height=1" );
    setTimeout(function(){
        logoutWindow.close();
        window.location = '/session/logout/';
    },100);
});
