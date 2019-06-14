import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import axios from '../../../common/presetAxios';
import { BASE_URL } from '../../../common/constants';
import { closeSearch, setListLectures } from '../../../actions/timetable/index';
import SearchFilter from '../../SearchFilter';
import '../../../static/css/font-awesome.min.css';


class SearchSubSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputVal: '',
      autoComplete: '',
      type: new Set(['ALL']),
      department: new Set(['ALL']),
      grade: new Set(['ALL']),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps.open) {
      return {
        inputVal: '',
        type: new Set(['ALL']),
        department: new Set(['ALL']),
        grade: new Set(['ALL']),
      }; // When Close the Search, initialize the state
    }
    return null;
  }

  hideSearch = () => {
    this.props.closeSearchDispatch();
  }

  searchStart = () => {
    const { type, department, grade, inputVal } = this.state;
    if (type.size === 1 && department.size === 1 && grade.size === 1 && inputVal.length === 0) {
      if (type.has('ALL') && department.has('ALL') && grade.has('ALL')) {
        alert('검색 조건을 선택해 주세요');
        return;
      }
    }
    this.props.closeSearchDispatch();

    axios.post(`${BASE_URL}/api/timetable/search`, {
      year: this.props.year,
      semester: this.props.semester,
      department: Array.from(department),
      type: Array.from(type),
      grade: Array.from(grade),
      keyword: inputVal,
    })
      .then((response) => {
        const lectures = response.data.courses;
        this.props.setListLecturesDispatch('search', lectures);
      })
      .catch((response) => {
      });
  }

  clickCircle = (filter_) => {
    const filterName = filter_.name;
    const value = filter_.value;
    const isChecked = filter_.isChecked;
    if (isChecked) {
      this.setState((prevState) => {
        const filter = prevState[filterName];
        if (value === 'ALL') {
          filter.clear();
        }
        filter.add(value);
        return prevState;
      });
    }
    else {
      this.setState((prevState) => {
        const filter = prevState[filterName];
        filter.delete(value);
        return prevState;
      });
    }
  }

  handleInput(e) {
    const value = e.target.value;

    this.setState({
      inputVal: e.target.value,
      autoComplete: '',
    });

    if (!value) {
      return;
    }

    axios.post(`${BASE_URL}/api/timetable/autocomplete`, {
      year: this.props.year,
      semester: this.props.semester,
      keyword: value,
    })
      .then((response) => {
        const { complete } = response.data;
        if (value !== this.state.inputVal) {
          return;
        }
        this.setState({
          autoComplete: complete.substring(value.length, complete.length),
        });
      })
      .catch((response) => {
      });
  }

  autocompleteApply() {
    this.setState(prevState => ({
      inputVal: prevState.inputVal + prevState.autoComplete,
      autoComplete: '',
    }));
  }

  autocompleteCLear() {
    this.setState({
      inputVal: '',
      autoComplete: '',
    });
  }

  keyPress(e) {
    if (e.keyCode === 9) {
      this.autocompleteApply();
      e.stopPropagation(); // Prevent move focus
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();
    }
    else if (e.keyCode === 13) {
      this.searchStart();
    }
  }

  render() {
    if (!this.props.open) {
      return null;
    }
    else {
      const { inputVal, autoComplete } = this.state;
      return (
        <div className="search-extend">
          <div className="search-form-wrap">
            <form method="post">
              <div className="search-keyword">
                <i className="search-keyword-icon" />
                <div className="search-keyword-text-wrap">
                  <input
                    className="search-keyword-text"
                    type="text"
                    name="keyword"
                    autoComplete="off"
                    placeholder="검색"
                    value={inputVal}
                    onKeyDown={e => this.keyPress(e)}
                    onChange={e => this.handleInput(e)}
                  />
                  <div className="search-keyword-autocomplete">
                    <span className="search-keyword-autocomplete-space">{inputVal}</span>
                    <span className="search-keyword-autocomplete-body">{autoComplete}</span>
                  </div>
                </div>
              </div>
              <SearchFilter
                clickCircle={this.clickCircle}
                inputName="type"
                titleName="구분"
                valueArr={['ALL', 'GR', 'MGC', 'BE', 'BR', 'EG', 'HSE', 'OE', 'ME', 'MR', 'ETC']}
                nameArr={['전체', '공통', '교필', '기선', '기필', '석박', '인선', '자선', '전선', '전필', '기타']}
              />
              <SearchFilter
                clickCircle={this.clickCircle}
                inputName="department"
                titleName="학과"
                valueArr={['ALL', 'HSS', 'CE', 'MSB', 'ME', 'PH', 'BiS', 'IE', 'ID', 'BS', 'MAS', 'NQE', 'EE', 'CS', 'AE', 'CH', 'CBE', 'MS', 'ETC']}
                nameArr={['전체', '인문', '건환', '기경', '기계', '물리', '바공', '산공', '산디', '생명', '수학', '원양', '전자', '전산', '항공', '화학', '생화공', '신소재', '기타']}
              />
              <SearchFilter
                clickCircle={this.clickCircle}
                inputName="grade"
                titleName="학년"
                valueArr={['ALL', '100', '200', '300', '400']}
                nameArr={['전체', '100번대', '200번대', '300번대', '400번대']}
              />
              <div className="search-filter search-filter-time">
                <label className="search-filter-title fixed-ko">시간</label>
                <div className="search-filter-elem">
                  <label>
                    시간표에서 드래그
                  </label>
                </div>
                <input id="search-filter-time-day" name="day" type="text" />
                <input id="search-filter-time-begin" name="begin" type="text" />
                <input id="search-filter-time-end" name="end" type="text" />
              </div>
              <div id="search-button-group">
                <span type="button" id="search-button" onClick={() => this.searchStart()}>검색</span>
                <span type="button" id="search-cancel" onClick={() => this.hideSearch()}>취소</span>
              </div>
            </form>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = state => ({
  open: state.timetable.search.open,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = dispatch => ({
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  setListLecturesDispatch: (code, lectures) => {
    dispatch(setListLectures(code, lectures));
  },
});

SearchSubSection.propTypes = {
  open: PropTypes.bool.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
};

SearchSubSection = connect(mapStateToProps, mapDispatchToProps)(SearchSubSection);

export default SearchSubSection;
