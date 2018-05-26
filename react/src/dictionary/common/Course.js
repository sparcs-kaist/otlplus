import React, { Component } from 'react';
import ScoreTable from './ScoreTable';

class Course extends Component {
  render() {
    const gradelist = [
      [0, "?"],[1, "F"],[2, "F"],[3, "F"],[4, "D-"],[5, "D"],[6, "D+"],[7, "C-"],[8, "C"],[9, "C+"],[10, "B-"],[11, "B"],[12, "B+"],[13, "A-"],[14, "A"],[15, "A+"]
    ];
    const score = {
      grade: 11,
      load: 3,
      speech: 3,
      total: 6,
    };
    return (
      <div className="panel panel-default course">
        <div className="panel-body">
          <div className="row">
            <div className="label-title ellipsis-wrapper col-xs-24 col-sm-12 col-md-13 col-lg-14">
              <h4 style={{marginTop:6, lineHeight:1.2}} className="ellipsis-content">AA010 : 리더십강좌</h4>
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
                      {/*for 문*/}
                      <span className="label-description">
                   <span className="professors">
                        <label>
                            <input className="professor chkone" type="checkbox" autocomplete="off" checked name="{{result.id}}" value="{{pinfo.id}}" />
                            <a href="/review/result/course/{{result.id}}/{{pinfo.id}}"><span className="label label-default">ALL</span></a>
                        </label>
                    </span>
                </span>
                      {/*for 문*/}
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
                    등록되지 않았습니다.
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