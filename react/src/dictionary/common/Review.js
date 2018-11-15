import React, { Component } from 'react';

import ScoreTableReview from './../common/ScoreTableReview';

class Review extends Component {
  render() {
    const gradelist = [
      [0, "?"],[1, "F"],[2, "F"],[3, "F"],[4, "D-"],[5, "D"],[6, "D+"],[7, "C-"],[8, "C"],[9, "C+"],[10, "B-"],[11, "B"],[12, "B+"],[13, "A-"],[14, "A"],[15, "A+"]
    ];
    const score = this.props.review.score;
    const review_paragraph_list = this.props.review.comment.split('\r\n\r\n');
    const review_paragraphs = review_paragraph_list.map((e) => {
      const break_list = e.split('\n');
      const breaks = [];
      for (let i = 0; i < break_list.length; i++) {
        breaks.push(break_list[i]);
        if(i === break_list.length - 1) {
          break;
        }
        breaks.push(<br />);
      }
      return (
        <p key={e[0]}>{breaks}</p>
      );
    });
    review_paragraphs.unshift(<p></p>);
    review_paragraphs.push(<p></p>);
    return (
      <div className="panel panel-default review">
        <div className="panel-body">
          <div className="row">
            <div id={this.props.review.id} style={{cursor:'Pointer'}} className="label-title lecture ellipsis-wrapper col-xs-24 col-sm-24 col-md-12">
              <input type="hidden" id="csrf_token" value="{csrf_token}" />
                <input type="hidden" name={this.props.review.id} value={this.props.review.course_id} />
                  <input type="hidden" name="course_id" value={this.props.review.id} />
                    <h4 style={{marginTop:6, marginBottom:0, lineHeight:1.2}} className="ellipsis-content">{this.props.review.course_code} :  {this.props.review.lecture_title} </h4>
            </div>
            <div className="col-xs-24 col-sm-24 col-md-12">
                <span className="hidr-r">
                <ScoreTableReview gradelist={gradelist} score={score} like={0} />
                </span>
            </div>
            <div id={this.props.review.id} style={{cursor:'Pointer'}} className="label-title lecture ellipsis-wrapper col-xs-24">
              <h4 style={{ marginTop:3, lineHeight:1.2 }} className="ellipsis-content"><small className="text-muted"> {this.props.review.professor_name}       {this.props.review.lecture_year}   {this.props.review.lecture_semester} </small></h4>
            </div>

            <div className="col-xs-24 comment text-muted " style={{cursor:'Pointer'}} id={this.props.review.id}>
              <input type="hidden" name={this.props.review.id} value={this.props.review.id} />
              {review_paragraphs}
            </div>
            <div className="col-xs-24">
                <span className="score_table_bottomr hidr" style={{width:210}}>
                    <ScoreTableReview bottom gradelist={gradelist} score={score} like={0} />
                </span>

              {
                this.props.user ?
                <div className="col-xs-24 button-box-review">
                  <a className="declaration-button not-active">
                    <i className="fa fa-exclamation-circle" style={{verticalAlign: 'baseline'}}/>
                    &nbsp;신고하기&nbsp;
                  </a>
                  {this.props.alreadyup ?
                    <a className="declaration-button not-active {{result.id}}" id="{{result.id}}"
                       style={{paddingRight: 0}}>
                      <i className="fa fa-check {{result.id}}" style={{verticalAlign: 'baseline'}} />
                    </a> :
                    <a className="like-button {{result.id}}" id="{{result.id}}" style={{paddingRight: 0}}>
                      <i className="fa fa-thumbs-up {{result.id}}" style={{verticalAlign: 'baseline'}}/>
                      &nbsp;좋아요
                    </a>
                  }
                </div>
                  : null
              }
            </div>
          </div>
        </div>
      </div>
  );
  }
}

export default Review;