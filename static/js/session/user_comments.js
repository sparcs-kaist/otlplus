$(document).ready(function(){
    loadItems();
});
var pageNum = 0;
var hasNextPage = true;
var conainer = $('#my-comments');


var loadOnScroll = function() {
    if (conainer[0].scrollHeight - conainer.scrollTop() == conainer.outerHeight()) {
        conainer.unbind('scroll');
        loadItems();
    }
};

var loadItems = function() {
    if (hasNextPage === false) {
        return false
    }

    pageNum = pageNum + 1;
    var url = "/review/user/json/" + pageNum;

    $.ajax({
        type:"GET",
        url: url,
        success: function(responseData) {
            var data = JSON.parse(responseData);
            hasNextPage = data.hasNext;
            var html = [];

            html.push('<script type="text/javascript" src="/media/js/review/components/review.js"></s','cript>')
            $.each(data.results, function(index, result){
                if(result.type == "comment"){

                    html.push('<div class="panel panel-default review"><div class="panel-body"><div class="row">')
                    html.push('<div id="',result.id,'" class="label-title lecture ellipsis-wrapper col-xs-24 col-sm-24 col-md-12">')
                    html.push('<h4 style="margin-top:6px;margin-bottom:0px;line-height:1.2" class="ellipsis-content">',result.course_code,' : ',result.lecture_title,'</h4>')
                    html.push('</div><div class="col-xs-24 col-sm-24 col-md-12">')
                    html.push('<input type="hidden" name="',result.id,'" value="',result.course_id,'">')
                    html.push('<input type="hidden" name="course_id" value="',result.id,'">')
                    html.push('<span class="hidr-r">')
                    html.push('<div class="score_table text-left col-xs-24" style="margin-right:-40px; min-width:350px; display:inline-block" >')

                    html.push('<div class="score-elem-review">')
                    html.push('성적&nbsp ')
                                for(j=0;j<result.gradelist.length;j++){
                                    if(result.gradelist[j][0]===result.score.grade){
                                html.push('<span class="score_letter-review">')
                                html.push(result.gradelist[j][1])
                                html.push('</span>')
                                    }
                                }
                    html.push('</div>')
                    html.push('<div class="score-elem-review">')
                        html.push('널널&nbsp ')
                                for(j=0;j<result.gradelist.length;j++){
                                    if(result.gradelist[j][0]===result.score.load){
                                html.push('<span class="score_letter-review">')
                                html.push(result.gradelist[j][1])
                                html.push('</span>')
                                    }
                                }
                    html.push('</div>')
                    html.push('<div class="score-elem-review">')
                        html.push('강의&nbsp ')
                                for(j=0;j<result.gradelist.length;j++){
                                    if(result.gradelist[j][0]===result.score.speech){
                                html.push('<span class="score_letter-review">')
                                html.push(result.gradelist[j][1])
                                html.push('</span>')
                                    }
                                }
                    html.push('</div>')
                    html.push('<div class="score-elem-review">')
                        html.push('종합&nbsp ')
                                for(j=0;j<result.gradelist.length;j++){
                                    if(result.gradelist[j][0]===result.score.total){
                                html.push('<span class="score_letter-review">')
                                html.push(result.gradelist[j][1])
                                html.push('</span>')
                                    }
                                }
                    html.push('</div>')
                    html.push('<div class="score-elem-review">')
                        html.push('추천&nbsp ')
                                html.push('<span class="score_letter-review like_num ')
                                html.push(result.id,'">')
                                html.push(result.like)
                                html.push('</span>')
                    html.push('</div>')
                    html.push('</div>')
                    html.push('</span></div>')
                    html.push('<div id="',result.id,'" class="label-title lecture ellipsis-wrapper col-xs-24">')
                    html.push('<h4 style="margin-top:3px;line-height:1.2" class="ellipsis-content"><small class="text-muted">',result.professor_name,result.lecture_year," ",result.lecture_semester, '</small></h4>') // added semester info
                    html.push('</div>')
                    html.push('<div class="col-xs-24 comment text-muted" style="cursor:Pointer" id="')
                    html.push(result.id)
                    html.push('"><input type="hidden" name="')
                    html.push(result.id)
                    html.push('" value="')
                    html.push(result.id)
                    html.push('"><p></p><p>')
                    html.push(result.comment.replace(/\n/g , "<br>"))
                    html.push('</p><p></p></div><div class="col-xs-24"><span class="score_table_bottomr hidr" style="width:210px">')
                    html.push('<div class="score_table-bottomr text-left col-xs-24" style="min-width:210px; padding:0px; display:inline-block" >')
                    html.push('<div class="score-elem-review">')
                    html.push('성적&nbsp ')
                                for(j=0;j<result.gradelist.length;j++){
                                    if(result.gradelist[j][0]===result.score.grade){
                                html.push('<span class="score_letter-review">')
                                html.push(result.gradelist[j][1])
                                html.push('</span>')
                                    }
                            }
                    html.push('</div>')
                    html.push('<div class="score-elem-review">')
                        html.push('널널&nbsp ')
                                for(j=0;j<result.gradelist.length;j++){
                                    if(result.gradelist[j][0]===result.score.load){
                                html.push('<span class="score_letter-review">')
                                html.push(result.gradelist[j][1])
                                html.push('</span>')
                                    }
                            }
                    html.push('</div>')
                    html.push('<div class="score-elem-review">')
                        html.push('강의&nbsp ')
                                for(j=0;j<result.gradelist.length;j++){
                                    if(result.gradelist[j][0]===result.score.speech){
                                html.push('<span class="score_letter-review">')
                                html.push(result.gradelist[j][1])
                                html.push('</span>')
                                    }
                            }
                    html.push('</div>')
                    html.push('<div class="score-elem-review">')
                        html.push('종합&nbsp ')
                                for(j=0;j<result.gradelist.length;j++){
                                    if(result.gradelist[j][0]===result.score.total){
                                html.push('<span class="score_letter-review">')
                                html.push(result.gradelist[j][1])
                                html.push('</span>')
                                    }
                                }
                    html.push('</div>')
                    html.push('<div class="score-elem-review">')
                        html.push('추천&nbsp ')
                                html.push('<span class="score_letter-review like_num ')
                                html.push(result.id,'">')
                                html.push(result.like)
                                html.push('</span>')
                    html.push('</div>')

                html.push('</div>')
                html.push('</span>')
                html.push('<div class="col-xs-24 button-box-review"><a class="declaration-button not-active"><i class="fa fa-exclamation-circle"></i> 신고하기</a><a class="')
                if(result.already_up){
                    html.push('declaration-button not-active ')
                    html.push(result.id)
                    html.push('" id="')
                    html.push(result.id)
                    html.push('" style="padding-right:0px"><i class="fa fa-check '+result.id+'"></i> 좋아요</a></div>')
                }
                else{
                    html.push('like-button ')
                    html.push(result.id)
                    html.push('" id="')
                    html.push(result.id)
                    html.push('" style="padding-right:0px"><i class="fa fa-thumbs-up '+result.id +'"></i> 좋아요</a></div>')
                }
                html.push('</div></div></div></div></div>')

                }
            });
            $("#datacall").before(html.join(""));
        },
        error: function(){
            hasNextPage=false;
        },
        complete: function(data){
            conainer.bind('scroll', loadOnScroll);
        }
    });
};