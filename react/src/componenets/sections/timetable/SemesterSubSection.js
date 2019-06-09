import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from '../../../presetAxios';
import { setSemester, setTimetables, setListLectures } from '../../../actions/timetable/index';

const semesterName = {
  1: '봄',
  2: '여름',
  3: '가을',
  4: '겨울',
};

class SemesterSubSection extends Component {
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
    this.props.setSemesterDispatch(2018, 1);

    axios.post('/api/timetable/semester', {
    })
      .then((response) => {
        this.setState(prevState => ({
          startYear: response.data.start_year,
          startSemester: response.data.start_semester,
          endYear: response.data.end_year,
          endSemester: response.data.end_semester,
        }));
        this.props.setSemesterDispatch(response.data.current_year, response.data.current_semester);
        this._semesterChanged(response.data.current_year, response.data.current_semester);
      })
      .catch((response) => {
        console.log(response);
      });
  }

  _semesterChanged(year, semester) {
    axios.post('/api/timetable/table_load', {
      year: year,
      semester: semester,
    })
      .then((response) => {
        this.props.setTimetablesDispatch(response.data);
      })
      .catch((response) => {
        console.log(response);
      });

    axios.post('/api/timetable/list_load_major', {
      year: year,
      semester: semester,
    })
      .then((response) => {
        for (let i = 0, code; (code = ['ID', 'CS'][i]); i++) {
          this.props.setListLecturesDispatch(code, response.data.filter(lecture => (lecture.major_code === code)));
        }
      })
      .catch((response) => {
        console.log(response);
      });

    axios.post('/api/timetable/list_load_humanity', {
      year: year,
      semester: semester,
    })
      .then((response) => {
        this.props.setListLecturesDispatch('humanity', response.data);
      })
      .catch((response) => {
        console.log(response);
      });

    axios.post('/api/timetable/wishlist_load', {
      year: year,
      semester: semester,
    })
      .then((response) => {
        this.props.setListLecturesDispatch('cart', response.data);
      })
      .catch((response) => {
        console.log(response);
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
    this._semesterChanged(year, semester);
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
    this._semesterChanged(year, semester);
  }

  render() {
    if (this.props.year && this.props.semester) {
      return (
        <div id="semester">
          <div id="semester-prev" className={(this.props.year === this.state.startYear) && (this.props.semester === this.state.startSemester) ? 'disable' : ''} onClick={() => this.semesterPrev()}><i /></div>
          <span id="semester-text">{`${this.props.year} ${semesterName[this.props.semester]}`}</span>
          <div id="semester-next" className={(this.props.year === this.state.endYear) && (this.props.semester === this.state.endSemester) ? 'disable' : ''} onClick={() => this.semesterNext()}><i /></div>
        </div>
      );
    }
    else {
      return (
        <div id="semester">
          <div id="semester-prev"><i /></div>
          <span id="semester-text">불러오는 중</span>
          <div id="semester-next"><i /></div>
        </div>
      );
    }
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
  setTimetablesDispatch: (timetables) => {
    dispatch(setTimetables(timetables));
  },
  setListLecturesDispatch: (code, lectures) => {
    dispatch(setListLectures(code, lectures));
  },
});

SemesterSubSection = connect(mapStateToProps, mapDispatchToProps)(SemesterSubSection);

export default SemesterSubSection;
