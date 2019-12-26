import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';

import { BASE_URL } from '../../../common/constants';
import { clearLectureActive } from '../../../actions/timetable/lectureActive';
import { clearListsLectures } from '../../../actions/timetable/list';
import { setSemester } from '../../../actions/timetable/semester';
import { clearTimetables } from '../../../actions/timetable/timetable';


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
    const { setSemesterDispatch } = this.props;

    axios.post(`${BASE_URL}/api/timetable/semester`, {
    })
      .then((response) => {
        this.setState(prevState => ({
          startYear: response.data.start_year,
          startSemester: response.data.start_semester,
          endYear: response.data.end_year,
          endSemester: response.data.end_semester,
        }));
        setSemesterDispatch(response.data.current_year, response.data.current_semester);
      })
      .catch((response) => {
      });
  }

  semesterPrev() {
    const { year, semester, setSemesterDispatch, clearLectureActiveDispatch, clearTimetablesDispatch, clearListsLecturesDispatch } = this.props;

    const newYear = (semester === 1) ? year - 1 : year;
    const newSemester = (semester === 1) ? 3 : 1;

    setSemesterDispatch(newYear, newSemester);
    clearLectureActiveDispatch();
    clearTimetablesDispatch();
    clearListsLecturesDispatch();
  }

  semesterNext() {
    const { year, semester, setSemesterDispatch, clearLectureActiveDispatch, clearTimetablesDispatch, clearListsLecturesDispatch } = this.props;

    const newYear = (semester === 3) ? year + 1 : year;
    const newSemester = (semester === 3) ? 1 : 3;

    setSemesterDispatch(newYear, newSemester);
    clearLectureActiveDispatch();
    clearTimetablesDispatch();
    clearListsLecturesDispatch();
  }

  render() {
    const { t } = this.props;
    const { year, semester } = this.props;
    const { startYear, startSemester, endYear, endSemester } = this.state;

    const semesterName = {
      1: t('ui.semester.spring'),
      2: t('ui.semester.summer'),
      3: t('ui.semester.fall'),
      4: t('ui.semester.winter'),
    };

    if (year && semester) {
      return (
        <div className={classNames('section', 'section--semester', t('jsx.className.semesterByLang'))}>
          <div className={classNames(((year === startYear) && (semester === startSemester) ? 'disable' : ''))} onClick={() => this.semesterPrev()}><i className={classNames('icon', 'icon--semester-prev')} /></div>
          <span>{`${year} ${semesterName[semester]}`}</span>
          <div className={classNames(((year === endYear) && (semester === endSemester) ? 'disable' : ''))} onClick={() => this.semesterNext()}><i className={classNames('icon', 'icon--semester-next')} /></div>
        </div>
      );
    }
    return (
      <div className={classNames('section', 'section--semester')}>
        <div className={classNames('disable')}><i className={classNames('icon', 'icon--semester-prev')} /></div>
        <span>{t('ui.placeholder.loading')}</span>
        <div className={classNames('disable')}><i className={classNames('icon', 'icon--semester-next')} /></div>
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
  clearLectureActiveDispatch: () => {
    dispatch(clearLectureActive());
  },
  clearTimetablesDispatch: () => {
    dispatch(clearTimetables());
  },
  clearListsLecturesDispatch: () => {
    dispatch(clearListsLectures());
  },
});

SemesterSection.propTypes = {
  year: PropTypes.number,
  semester: PropTypes.number,
  setSemesterDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
  clearTimetablesDispatch: PropTypes.func.isRequired,
  clearListsLecturesDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SemesterSection));
