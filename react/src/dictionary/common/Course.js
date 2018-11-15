import React, { Component } from 'react';
import ScoreTable from './ScoreTable';

class Label extends Component {
  render() {
    return (
      <span>
        {"\n                \n                "}
        <span className="label-description">
           <span className="professors">
                <label className="active">
                    <input className="professor chkone" type="checkbox" autocomplete="off" checked name={this.props.id} value={this.props.pid} />
                    <a href={`/review/result/course/${this.props.id}/${this.props.pid}`}><span className="label label-default">{this.props.pname}</span></a>
                </label>
            </span>
        </span>
      </span>
    );
  }
}

class Course extends Component {
  render() {
    const course = this.props.course;
    const gradelist = course.gradelist;
    const score = course.score;
    const professorlist = course.prof_info;
    const professors = professorlist.map((e) => {
      return (
        <Label pid={e.id} pname={e.name} id={course.id}/>
      )
    });
    return (
      <div className="panel panel-default course">
        <div className="panel-body">
          <div className="row">
            <div className="label-title ellipsis-wrapper col-xs-24 col-sm-12 col-md-13 col-lg-14">
              <h4 style={{marginTop:6, lineHeight:1.2}} className="ellipsis-content">{ course.code } : { course.title }</h4>
            </div>
            <div className="col-xs-24 col-sm-12 col-md-11 col-lg-10">
              <input type="hidden" name="course_id" value="{{result.id}}" />
                <span className="hid-r">
                <ScoreTable gradelist={gradelist} score={score} alreadyup={false} />
                </span>
            </div>
            <div className="label-row col-xs-24">
              <table>
                <tr>
                  <td style={{ verticalAlign: 'top' }}>
                <span className="label-title">
                담당 교수
                </span>
                  </td>
                  <td>
                    <div>
                      { professors }
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <div className="label-row col-xs-24" style={{overflowX: 'hidden',overflowY: 'hidden'}}>
              <table>
                <tbody>
                <tr>
                  <td style={{verticalAlign:'top'}}>
                <span className="label-title">
                한줄 요약
                </span>
                  </td>
                </tr>
                </tbody>
              </table>
              <div className="table-responsive" style={{marginTop: -31.6, marginBottom:-11, width: 'auto', border: 0, marginLeft: 82}} >
                <table className="table">
                  <tbody>
                  <tr>
                    <td style={{borderTop: 0}} >
                <span className="label-description" style={{lineHeight: '23px'}}>
                  {course.summury}
                </span>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-xs-24">
                <span className="score_table_bottom hid">
                <ScoreTable gradelist={gradelist} score={score} />
                </span>
            </div>

          </div>
        </div>
      </div>
  );
  }
}

export default Course;