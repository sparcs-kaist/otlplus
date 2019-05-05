import React, { Component } from 'react';
import OptionItem from './OptionItem';

class Option extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: ['ALL'],
      department: ['ALL'],
      grade: ['ALL'],
      semester: ['ALL'],
    };
    this.setType = this.setType.bind(this);
    this.setDepartment = this.setDepartment.bind(this);
    this.setGrade = this.setGrade.bind(this);
    this.setSemester = this.setSemester.bind(this);
  }

  setType(filter) {
    let newList;
    if(filter === 'ALL') {
      this.setState({
        type: ['ALL']
      });
    } else {
      if(this.state.type.includes(filter)) {
        newList = this.state.type.filter((item) => { return item !== filter});
        if(newList.length === 0) {
          this.setState({
            type: ['ALL'],
          });
        } else {
          this.setState({
            type: newList,
          });
        }
      } else {
        if(this.state.type.includes('ALL')) {
          this.setState({
            type: [filter],
          });
        }else {
          this.setState((prevState) => {
            return {
              type: prevState.type.concat([filter]),
            };
          });
        }
      }
    }
  }

  setDepartment(filter) {
    let newList;
    if(filter === 'ALL') {
      this.setState({
        department: ['ALL']
      });
    } else {
      if(this.state.department.includes(filter)) {
        newList = this.state.department.filter((item) => { return item !== filter});
        if(newList.length === 0) {
          this.setState({
            department: ['ALL'],
          });
        } else {
          this.setState({
            department: newList,
          });
        }
      } else {
        if(this.state.department.includes('ALL')) {
          this.setState({
            department: [filter],
          });
        }else {
          this.setState((prevState) => {
            return {
              department: prevState.department.concat([filter]),
            };
          });
        }
      }
    }
  }

  setGrade(filter) {
    let newList;
    if(filter === 'ALL') {
      this.setState({
        grade: ['ALL']
      });
    } else {
      if(this.state.grade.includes(filter)) {
        newList = this.state.grade.filter((item) => { return item !== filter});
        if(newList.length === 0) {
          this.setState({
            grade: ['ALL'],
          });
        } else {
          this.setState({
            grade: newList,
          });
        }
      } else {
        if(this.state.grade.includes('ALL')) {
          this.setState({
            grade: [filter],
          });
        }else {
          this.setState((prevState) => {
            return {
              grade: prevState.grade.concat([filter]),
            };
          });
        }
      }
    }
  }

  setSemester(filter) {
    this.setState({
      semester: [filter]
    });
  }

  render() {
    return (
        <div id="options" className={this.props.active? "col-xs-24 active" : "col-xs-24"}>
          <div className="form-group">
            <div className="row">
              <div className="label-row col-xs-24 controls">
                <table>
                  <tr>
                    <td style={{verticalAlign: 'top'}}>
                      <label className="sort-title control-label">분류</label>
                    </td>
                    <td>
                      <div>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio chkall typeName="type" name="전체" value="ALL"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="공통" value="GR"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="교필" value="MGC"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="기선" value="BE"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="기필" value="BR"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="석박" value="EG"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="인선" value="HSE"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="자선" value="OE"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="전선" value="ME"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="전필" value="MR"/>
                        <OptionItem clickHandler={this.setType} selection={this.state.type} radio typeName="type" name="기타" value="ETC"/>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="row">
              <div className="label-row col-xs-24 controls">
                <table>
                  <tr>
                    <td style={{verticalAlign:'top'}}>
                      <label className="sort-title control-label">학과</label>
                    </td>
                    <td>
                      <div>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} chkall typeName="department" name="전체" value="ALL"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="인문" value="HSS"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="건환" value="CE"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="기경" value="MSB"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="기계" value="MAE"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="물리" value="PH"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="바공" value="BiS"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="산공" value="IE"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="산디" value="ID"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="생명" value="BS"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="수리" value="MAS"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="원양" value="NQE"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="전자" value="EE"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="전산" value="CS"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="항공" value="MAE"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="화학" value="CH"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="생화공" value="CBE"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="신소재" value="MS"/>
                        <OptionItem clickHandler={this.setDepartment} selection={this.state.department} typeName="department" name="기타" value="ETC"/>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="row">
              <div className="label-row col-xs-24 controls">
                <table>
                  <tr>
                    <td style={{verticalAlign:'top'}}>
                      <label className="sort-title control-label">학년</label>
                    </td>
                    <td>
                      <div>
                        <OptionItem clickHandler={this.setGrade} selection={this.state.grade} chkall typeName="grade" name="전체" value="ALL"/>
                        <OptionItem clickHandler={this.setGrade} selection={this.state.grade} typeName="grade" name="000번대" value="000"/>
                        <OptionItem clickHandler={this.setGrade} selection={this.state.grade} typeName="grade" name="100번대" value="100"/>
                        <OptionItem clickHandler={this.setGrade} selection={this.state.grade} typeName="grade" name="200번대" value="200"/>
                        <OptionItem clickHandler={this.setGrade} selection={this.state.grade} typeName="grade" name="300번대" value="300"/>
                        <OptionItem clickHandler={this.setGrade} selection={this.state.grade} typeName="grade" name="400번대" value="400"/>
                        <OptionItem clickHandler={this.setGrade} selection={this.state.grade} typeName="grade" name="500번대" value="500"/>
                        <OptionItem clickHandler={this.setGrade} selection={this.state.grade} typeName="grade" name="석박사" value="HIGH"/>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

            </div>
          </div>


          <div className="form-group">
            <div className="row">
              <div className="label-row col-xs-24 controls">
                <table>
                  <tr>
                    <td style={{verticalAlign:'top'}}>
                      <label className="sort-title control-label">학기</label>
                    </td>
                    <td>
                      <div>
                        <OptionItem clickHandler={this.setSemester} selection={this.state.semester} chkall typeName="semester" name="전체" value="ALL"/>
                        <OptionItem clickHandler={this.setSemester} selection={this.state.semester} typeName="semester" name="다음" value="NEXT"/>
                        <OptionItem clickHandler={this.setSemester} selection={this.state.semester} typeName="semester" name="현재" value="NOW"/>
                        <OptionItem clickHandler={this.setSemester} selection={this.state.semester} typeName="semester" name="이전" value="PREV"/>
                        <OptionItem clickHandler={this.setSemester} selection={this.state.semester} typeName="semester" name="최근" value="RECENT"/>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

            </div>
          </div>


        </div>
  )
  }
}

export default Option;

