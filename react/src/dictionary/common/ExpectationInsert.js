import React, { Component } from 'react';

class ExpectationInsert extends Component {
  render() {
    const label_list = this.props.data.expectations;
    const labels = label_list.map((e) => {
      return (
        <span>
          <span className="label-b">
            {"\n                "}
            <a id="l{{lecture.lecid}}" href="/review/insert/{{ lecture.lecid }}/{{ lecture.lectime }}/" className="label deactive written">
              { e.title }({ e.old_code } { e.professor })% ifequal semester "0"{ e.year } { lecture.sem_char })% endifequal %
            </a>
            {"\n                "}
          </span>
          {"\n            \n          \n            \n              "}
        </span>
      )
    });
    return (
      <div>
        <div className="panel expect" style={{display:'inline-block', paddingRight:5}}>
          <div className="panel-title" style={{display:'inline-block'}}>
            <h4 style={{display:'inline-block'}}>학기 선택</h4>
          </div>
          <div className="panel-body" style={{lineHeight:2.3, paddingLeft:0, paddingRight:0, paddingBottom:5, display:'inline-block'}}>
            %for sem_num,sem_korstr in semesters%
            <span className="label-a">
              <a href="/review/insert/-1/{{sem_num}}/" id="{{sem_num}}" className="label deactive">
                  {sem_korstr}
              </a>
           </span>
            %endfor%
          </div>
        </div>
      </div>
    );
  }
}

export default ExpectationInsert;