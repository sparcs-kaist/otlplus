import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import axios from '../../../common/presetAxios';
import { BASE_URL } from '../../../common/constants';
import { setSemester } from '../../../actions/timetable/index';


const semesterName = {
  1: '봄',
  2: '여름',
  3: '가을',
  4: '겨울',
};

class SemesterSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startYear: null,
      startSemester: null,
      endYear: null,
      endSemester: null,
    };
  }

  componentDidMount() {
    axios.post(`${BASE_URL}/api/timetable/semester`, {
    })
      .then((response) => {
        this.setState(prevState => ({
          startYear: response.data.start_year,
          startSemester: response.data.start_semester,
          endYear: response.data.end_year,
          endSemester: response.data.end_semester,
        }));
        this.props.setSemesterDispatch(response.data.current_year, response.data.current_semester);
      })
      .catch((response) => {
      });
  }

  semesterPrev() {
    let year = this.props.year;
    let semester = this.props.semester;

    if (semester === 1) {
      year = year - 1;
      semester = 3;
    }
    else {
      semester = 1;
    }

    this.props.setSemesterDispatch(year, semester);
  }

  semesterNext() {
    let year = this.props.year;
    let semester = this.props.semester;

    if (semester === 3) {
      year = year + 1;
      semester = 1;
    }
    else {
      semester = 3;
    }

    this.props.setSemesterDispatch(year, semester);
  }

  render() {
    if (this.props.year && this.props.semester) {
      return (
        // eslint-disable-next-line react/jsx-indent
        <div id="semester">
          <div id="semester-prev" className={(this.props.year === this.state.startYear) && (this.props.semester === this.state.startSemester) ? 'disable' : ''} onClick={() => this.semesterPrev()}><i /></div>
          <span id="semester-text">{`${this.props.year} ${semesterName[this.props.semester]}`}</span>
          <div id="semester-next" className={(this.props.year === this.state.endYear) && (this.props.semester === this.state.endSemester) ? 'disable' : ''} onClick={() => this.semesterNext()}><i /></div>
        </div>
      );
    }
    return (
        // eslint-disable-next-line react/jsx-indent
        <div id="semester">
          <div id="semester-prev"><i /></div>
          <span id="semester-text">불러오는 중</span>
          <div id="semester-next"><i /></div>
        </div>
    );
  }
}

const mapStateToProps = state => ({
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = dispatch => ({
  setSemesterDispatch: (year, semester) => {
    dispatch(setSemester(year, semester));
  },
});

SemesterSection.propTypes = {
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
  setSemesterDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(SemesterSection);
