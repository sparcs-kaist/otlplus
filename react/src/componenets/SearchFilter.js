import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchCircle from './SearchCircle';


class SearchFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allChecked: true,
      checkNum: 1,
    };
  }

  clickCircle = (value, isChecked) => {
    const filter = {
      name: this.props.inputName,
      value: value,
      isChecked: isChecked,
    };
    this.props.clickCircle(filter);
    if (value === 'ALL' && isChecked) {
      this.setState({
        allChecked: true,
      }); // It is alreat send to Search
    }
    else if (isChecked) {
      // Check without all button, checkout all button
      if (this.state.allChecked) {
        this.setState({
          allChecked: false,
          checkNum: 1,
        });
        filter.value = 'ALL';
        filter.isChecked = false;
        this.props.clickCircle(filter);
      }
      else {
        this.setState(({ checkNum }) => ({
          checkNum: checkNum + 1,
        }));
      }
    }
    else { // When Check out somtething
      if (this.state.checkNum === 1) {
        this.setState({
          allChecked: true,
        }); // All circle check out so have to check all
        filter.value = 'ALL';
        filter.isChecked = true;
        this.props.clickCircle(filter);
      }
      else {
        this.setState(({ checkNum }) => ({
          checkNum: checkNum - 1,
        }));
        // All circle check out so have to check all
      }
    }
  }


  render() {
    const { inputName, titleName } = this.props;
    let valueArr;
    let nameArr;
    switch (inputName) {
      case 'type':
        valueArr = ['ALL', 'GR', 'MGC', 'BE', 'BR', 'EG', 'HSE', 'OE', 'ME', 'MR', 'ETC'];
        nameArr = ['전체', '공통', '교필', '기선', '기필', '석박', '인선', '자선', '전선', '전필', '기타'];
        break;
      case 'department':
        valueArr = ['ALL', 'HSS', 'CE', 'MSB', 'ME', 'PH', 'BiS', 'IE', 'ID', 'BS', 'MAS', 'NQE', 'EE', 'CS', 'AE', 'CH', 'CBE', 'MS', 'ETC'];
        nameArr = ['전체', '인문', '건환', '기경', '기계', '물리', '바공', '산공', '산디', '생명', '수학', '원양', '전자', '전산', '항공', '화학', '생화공', '신소재', '기타'];
        break;
      case 'grade':
        valueArr = ['ALL', '100', '200', '300', '400'];
        nameArr = ['전체', '100번대', '200번대', '300번대', '400번대'];
        break;
      default:
        valueArr = ['ALL'];
        nameArr = ['전체'];
    }
    const mapCircle = (value, index) => (
      <SearchCircle
        key={index}
        value={value}
        inputName={inputName}
        circleName={nameArr[index]}
        clickCircle={this.clickCircle}
        allChecked={this.state.allChecked}
      />
    );


    return (
      <div className="search-filter">
        <label className="search-filter-title fixed-ko">{ titleName }</label>
        <div className="search-filter-elem">
          {valueArr.map(mapCircle)}
        </div>
      </div>
    );
  }
}

SearchFilter.propTypes = {
  clickCircle: PropTypes.func.isRequired,
  inputName: PropTypes.string.isRequired,
  titleName: PropTypes.string.isRequired,
};

export default SearchFilter;
