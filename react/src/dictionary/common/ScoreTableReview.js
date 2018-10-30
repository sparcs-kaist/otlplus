import React, { Component } from 'react';

class ScoreTableReview extends Component {
  render() {
    let i;
    let grade, load, speech, total, like;
    const gradelist = this.props.gradelist;
    for (i in gradelist) {
      if(gradelist[i][0] === this.props.score.grade) {
        grade = gradelist[i][1];
      }
      if(gradelist[i][0] === this.props.score.load) {
        load = gradelist[i][1];
      }
      if(gradelist[i][0] === this.props.score.speech) {
        speech = gradelist[i][1];
      }
      if(gradelist[i][0] === this.props.score.total) {
        total = gradelist[i][1];
      }
    }
    like = this.props.like;
    const className=this.props.bottom ? "score_table-bottomr text-left col-xs-24" : "score_table text-left col-xs-24";
    const style=this.props.bottom ? {minWidth:210, padding:0, display:'inline-block'} : {cursor: 'default important!', marginRight:-40, minWidth:350, display:'inline-block'}
    return (
      <div className={className} style={style} >
        <div className="score-elem-review">
          성적&nbsp;&nbsp;
          <span className="score_letter-review" >{grade}</span>
        </div>
        <div className="score-elem-review">
          널널&nbsp;&nbsp;
          <span className="score_letter-review" >{load}</span>
        </div>
        <div className="score-elem-review">
          강의&nbsp;&nbsp;
          <span className="score_letter-review" >{speech}</span>
        </div>
        <div className="score-elem-review">
          종합&nbsp;&nbsp;
          <span className="score_letter-review" >{total}</span>
        </div>
        <div className="score-elem-review">
          추천&nbsp;&nbsp;
          <span className="score_letter-review like_num {{result.id}}" >{like}</span>
        </div>

      </div>


    );
  }
}

export default ScoreTableReview;