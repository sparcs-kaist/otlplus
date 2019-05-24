import React, { Component } from 'react';

import axios from '../componenets/presetAxios';
import Header from "../common/Header";

import { BASE_URL } from './../constants';

class InsertPage extends Component {
    componentWillMount() {
      axios.get(`${BASE_URL}api/review/insert`).
        then((res) => {
          console.log(res);
        }).
        catch((res) => {
          console.log(res);
        });
    }

    render() {
        return (
          <div className="row">
            <div className="col-xs-22 col-xs-offset-1 col-sm-20 col-sm-offset-2 col-md-18 col-md-offset-3 col-lg-16 col-lg-offset-4">
              % include 'review/components/expect.html' with view='insert' lectures=object %
            </div>
            <form id="contact" method="post" className="col-xs-22 col-xs-offset-1 col-sm-20 col-sm-offset-2 col-md-18 col-md-offset-3 col-lg-16 col-lg-offset-4">
              <div className="panel-b col-xs-24 expect">
                <div id="insert-complete-message">
                  <p>후기가 업로드되었습니다.</p>
                </div>
                <div className="select_menu panel-title">
                  %ifnotequal subjectname ""%
                  <h4>subjectname</h4>
                  %else%
                  <h4>과목을 선택해 주세요</h4>
                  %endifnotequal%
                </div>
                <div className="panel-body">

                  <div style={{marginTop: 15}}>
                    <div className="insert-div">
                      % csrf_token %
                      <textarea disabled="disabled" className="form-control insert-box" name="content" rows= "10" placeholder = "{{reviewguideline}}">comment</textarea>
                      <input type="hidden" name = "lectureid" value = "lecture_id" />
                      <input type="hidden" name = "semester" value = "semester" />
                    </div>
                    <div style={{width:230, verticalAlign:'top', display:'inline-block'}}>
                      <table className="col-xs-24">
                        <tr>
                          <td className="radio-head">
                            성적
                          </td>
                          <td>
                            <div className="col-xs-24" style={{padding:0}}>
                              % for single_grade in gradelist %
                              <label className="label-radio text-left">
                                <input type="radio" name="gradescore" className="hidden chkone" value="forloop.counter" checked />
                                  single_grade
                              </label>
                              % endfor %
                            </div>
                          </td>
                        </tr>
                        <tr >
                          <td className="radio-head">
                            널널
                          </td>
                          <td>
                            <div className="col-xs-24" style={{ padding:0, }}>
                              % for single_grade in gradelist %
                              <label className="label-radio text-left">
                                <input type="radio" name="loadscore" className="hidden chkone" value="forloop.counter" checked />
                                  single_grade
                              </label>
                              % endfor %
                            </div>
                          </td>
                        </tr>
                        <tr >
                          <td className="radio-head">
                            강의
                          </td>
                          <td>
                            <div className="col-xs-24" style={{ padding:0 }}>
                              % for single_grade in gradelist %
                              <label className="label-radio text-left">
                                <input type="radio" name="speechscore" className="hidden chkone" value="forloop.counter" checked />
                                  single_grade
                              </label>
                              % endfor %
                            </div>
                          </td>
                        </tr>
                        % ifnotequal -1 like %
                        <tr>
                          <td className="radio-head">
                            추천
                          </td>
                          <td>
                            <div className="col-xs-24" style={{ padding:0 }}>
                              <label className="label-radio text-left">
                                like
                              </label>
                            </div>
                          </td>
                        </tr>
                        % endifnotequal %
                      </table>
                    </div>

                  </div>
                </div>
              </div>
              <div className="text-right" style={{marginTop: 25}}>
                <input type="submit" style = {{display:'none'}} className="btn btn-review-delete" formaction = "../../../delete/" value="삭제" />
                  <button disabled="disabled" type="button" className="btn btn-review-upload">업로드</button>
              </div>

            </form>
          </div>
        )
    }
}

export default InsertPage;
