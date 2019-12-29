import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { clearLectureActive } from '../../../actions/timetable/lectureActive';
import { clearListsLectures } from '../../../actions/timetable/list';
import { setSemester } from '../../../actions/timetable/semester';
import { clearTimetables } from '../../../actions/timetable/timetable';
import { getTimetableSemester } from '../../../common/semesterFunctions';
import semesterShape from '../../../shapes/SemesterShape';


class SemesterSection extends Component {
  componentDidMount() {
    const { semesters } = this.props;

    if (semesters !== null) {
      this._initializeSemester();
    }
  }

  componentDidUpdate(prevProps) {
    const { semesters } = this.props;

    if ((prevProps.semesters === null) && (semesters !== null)) {
      this._initializeSemester();
    }
  }

  _initializeSemester = () => {
    const { semesters, setSemesterDispatch } = this.props;

    const currentSemester = getTimetableSemester(semesters);
    setSemesterDispatch(currentSemester.year, currentSemester.semester);
  }

  _isFirstSemester = (year, semester) => {
    const { semesters } = this.props;

    const semesterIdx = semesters.findIndex(s => ((s.year === year) && (s.semester === semester)));
    return (semesterIdx === 0);
  }

  _isLastSemester = (year, semester) => {
    const { semesters } = this.props;

    const semesterIdx = semesters.findIndex(s => ((s.year === year) && (s.semester === semester)));
    return (semesterIdx === (semesters.length - 1));
  }

  semesterPrev() {
    const { semesters, year, semester, setSemesterDispatch, clearLectureActiveDispatch, clearTimetablesDispatch, clearListsLecturesDispatch } = this.props;

    if (this._isFirstSemester(year, semester)) {
      return;
    }

    const semesterIdx = semesters.findIndex(s => ((s.year === year) && (s.semester === semester)));
    const targetSemester = semesters[semesterIdx - 1];

    setSemesterDispatch(targetSemester.year, targetSemester.semester);
    clearLectureActiveDispatch();
    clearTimetablesDispatch();
    clearListsLecturesDispatch();
  }

  semesterNext() {
    const { semesters, year, semester, setSemesterDispatch, clearLectureActiveDispatch, clearTimetablesDispatch, clearListsLecturesDispatch } = this.props;

    if (this._isLastSemester(year, semester)) {
      return;
    }

    const semesterIdx = semesters.findIndex(s => ((s.year === year) && (s.semester === semester)));
    const targetSemester = semesters[semesterIdx + 1];

    setSemesterDispatch(targetSemester.year, targetSemester.semester);
    clearLectureActiveDispatch();
    clearTimetablesDispatch();
    clearListsLecturesDispatch();
  }

  render() {
    const { t } = this.props;
    const { year, semester } = this.props;

    const semesterName = {
      1: t('ui.semester.spring'),
      2: t('ui.semester.summer'),
      3: t('ui.semester.fall'),
      4: t('ui.semester.winter'),
    };

    if (year && semester) {
      return (
        <div className={classNames('section', 'section--semester', t('jsx.className.semesterByLang'))}>
          <button className={classNames((this._isFirstSemester(year, semester) ? 'disable' : ''))} onClick={() => this.semesterPrev()}><i className={classNames('icon', 'icon--semester-prev')} /></button>
          <span>{`${year} ${semesterName[semester]}`}</span>
          <button className={classNames((this._isLastSemester(year, semester) ? 'disable' : ''))} onClick={() => this.semesterNext()}><i className={classNames('icon', 'icon--semester-next')} /></button>
        </div>
      );
    }
    return (
      <div className={classNames('section', 'section--semester', t('jsx.className.semesterByLang'))}>
        <button className={classNames('disable')}><i className={classNames('icon', 'icon--semester-prev')} /></button>
        <span>{t('ui.placeholder.loading')}</span>
        <button className={classNames('disable')}><i className={classNames('icon', 'icon--semester-next')} /></button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  semesters: state.common.semester.semesters,
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
  semesters: PropTypes.arrayOf(semesterShape),
  year: PropTypes.number,
  semester: PropTypes.number,
  setSemesterDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
  clearTimetablesDispatch: PropTypes.func.isRequired,
  clearListsLecturesDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SemesterSection));
