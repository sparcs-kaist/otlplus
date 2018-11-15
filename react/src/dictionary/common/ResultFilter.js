import React, { Component } from 'react';

class ResultFilter extends Component {
  render() {
    const criterion_list = [
      {
        value: "name",
        name: "이름순"
      },
      {
        value: "total",
        name: "평점순"
      },
      {
        value: "grade",
        name: "성적순"
      },
      {
        value: "load",
        name: "널널순"
      },
      {
        value: "speech",
        name: "강의순"
      },
    ];
    const filter_list = criterion_list.map((e) => {
      return (
        <label key={e.value}>
          <input className="chkone sort_button" type="checkbox" autocomplete="off" name="sort" value={e.value} />{e.name}
          <span className="fa-stack fa-lg">
            <i className="fa fa-circle-o fa-stack-2x" />
            <i className="fa fa-check fa-stack-1x" />
          </span>
        </label>
      );
    });
    return (
      <div id="filter">
        <div className="form-group">
          <div className="row">
            <div className="label-row col-xs-24 controls" >
              <table>
                <tr>
                  <td style={{verticalAlign:'top'}}>
                    <label className="sort-title control-label">정렬</label>
                  </td>
                  <td>
                    <div>

                      {this.props.children}

                    </div>
                  </td>
                </tr>
              </table>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default ResultFilter;