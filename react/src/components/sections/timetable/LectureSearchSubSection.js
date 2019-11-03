import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';

import { BASE_URL } from '../../../common/constants';
import { closeSearch, setListLectures, clearSearchListLectures } from '../../../actions/timetable/index';
import SearchFilter from '../../SearchFilter';
import '../../../static/css/font-awesome.min.css';


class LectureSearchSubSection extends Component {
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

  hideSearch = () => {
    const { closeSearchDispatch } = this.props;

    closeSearchDispatch();
  }

  searchStart = () => {
    const { type, department, grade, inputVal } = this.state;
    const { year, semester, start, day, end, closeSearchDispatch, clearSearchListLecturesDispatch, setListLecturesDispatch } = this.props;

    if (type.size === 1 && department.size === 1 && grade.size === 1 && inputVal.length === 0
      && !(start !== null && end !== null && day !== null)) {
      if (type.has('ALL') && department.has('ALL') && grade.has('ALL')) {
        // eslint-disable-next-line no-alert
        alert('검색 조건을 선택해 주세요');
        return;
      }
    }
    closeSearchDispatch();
    clearSearchListLecturesDispatch();

    axios.get(`${BASE_URL}/api/lectures`, { params: {
      year: year,
      semester: semester,
      department: Array.from(department),
      type: Array.from(type),
      grade: Array.from(grade),
      keyword: inputVal,
      begin: (start !== null) ? start.toString() : '',
      end: (end !== null) ? end.toString() : '',
      day: (day !== null) ? day.toString() : '',
    } })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        const lectures = response.data;
        setListLecturesDispatch('search', lectures);
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
    const { year, semester } = this.props;

    this.setState({
      inputVal: e.target.value,
      autoComplete: '',
    });

    if (!value) {
      return;
    }

    axios.get(`${BASE_URL}/api/lectures/autocomplete`, { params: {
      year: year,
      semester: semester,
      keyword: value,
    } })
      .then((response) => {
        const { inputVal } = this.state;
        const newProps = this.props;
        const complete = response.data;
        if (value !== inputVal
          || (newProps.year !== year || newProps.semester !== semester)
        ) {
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
    const { inputVal, autoComplete } = this.state;
    const { start, end, day } = this.props;

    return (
      <div className={classNames('search-area')}>
        <form method="post">
          <div className={classNames('title', 'title--search')}>
            <i className={classNames('icon', 'icon--search')} />
            <div>
              <input
                type="text"
                name="keyword"
                autoComplete="off"
                placeholder="검색"
                value={inputVal}
                onKeyDown={e => this.keyPress(e)}
                onChange={e => this.handleInput(e)}
              />
              <div className={classNames('search-keyword-autocomplete')}>
                <span className={classNames('search-keyword-autocomplete-space')}>{inputVal}</span>
                <span className={classNames('search-keyword-autocomplete-body')}>{autoComplete}</span>
              </div>
            </div>
          </div>
          <div>
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
            <div className={classNames('attribute')}>
              <label>시간</label>
              { day !== null
                ? (
                  <label className={classNames('text-button')}>
                    {`${['월요일', '화요일', '수요일', '목요일', '금요일'][day]} \
                      ${8 + Math.floor(start / 2)}:${['00', '30'][start % 2]} ~ \
                      ${8 + Math.floor(end / 2)}:${['00', '30'][end % 2]}`}
                  </label>
                )
                : (
                  <label>
                    시간표에서 드래그
                  </label>
                )
              }
            </div>
          </div>
          <div className={classNames('buttons')}>
            <span type="button" className={classNames('text-button')} onClick={() => this.searchStart()}>검색</span>
            <span type="button" className={classNames('text-button')} onClick={() => this.hideSearch()}>취소</span>
          </div>
          <div className={classNames('divider')} />
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  start: state.timetable.search.start,
  end: state.timetable.search.end,
  day: state.timetable.search.day,
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
  clearSearchListLecturesDispatch: () => {
    dispatch(clearSearchListLectures());
  },
});

LectureSearchSubSection.propTypes = {
  start: PropTypes.number,
  end: PropTypes.number,
  day: PropTypes.number,
  year: PropTypes.number,
  semester: PropTypes.number,
  closeSearchDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  clearSearchListLecturesDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(LectureSearchSubSection);
