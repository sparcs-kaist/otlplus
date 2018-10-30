import React, { Component } from 'react';

class ScoreTable extends Component {
  render() {
    let i;
    let grade, load, speech, total;
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
    return (
      <div className="cursor:default important!; score_table text-left col-xs-24">
        <div className="col-xs-12 col-sm-6 score-elem">성적&nbsp;<span className="score score_letter" >{grade}</span></div>
        <div className="col-xs-12 col-sm-6 score-elem">널널&nbsp;<span className="score score_letter" >{load}</span></div>
        <div className="col-xs-12 col-sm-6 score-elem">강의&nbsp;<span className="score score_letter" >{speech}</span></div>
        <div className="col-xs-12 col-sm-6 score-elem">종합&nbsp;<span className="score score_letter" >{total}</span></div>
      </div>
    );
  }
}

export default ScoreTable;