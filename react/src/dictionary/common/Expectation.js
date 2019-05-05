import React, { Component } from 'react';

class Expectation extends Component {
  render() {
      const label_list = this.props.data.expectations;
      const labels = label_list.map((e) => {
        return (
          <span>
            <span className="h4">
              {"\n                "}
              <a href="/review/result/professor/{{ e.id }}" className="label label-default">
                {`\n                  ${e.name}\n                `}
              </a>
              {"\n                "}
            </span>
            {"\n            \n          \n            \n              "}
          </span>
        )
      });
      return (
        <div className="panel-b col-xs-24 expect" >
          <div className="panel-title">
            <h4>혹시 이 교수님을 검색하셨나요?</h4>
          </div>
          <div className="panel-body">
            <div className="col-xs-24" style={{padding: 0}}>
              {labels}
            </div>
          </div>
        </div>
      );
  }
}

export default Expectation;