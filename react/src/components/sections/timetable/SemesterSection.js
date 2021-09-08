import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { setSemester } from '../../../actions/timetable/semester';

import semesterShape from '../../../shapes/SemesterShape';

import { getTimetableSemester, getSemesterName } from '../../../utils/semesterUtils';


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
    const { startSemester, semesters, setSemesterDispatch } = this.props;

    const initialSemester = (startSemester !== undefined)
      ? startSemester
      : getTimetableSemester(semesters);
    setSemesterDispatch(initialSemester.year, initialSemester.semester);
  }

  _isFirstSemester = (year, semester) => {
    const { semesters } = this.props;

    const semesterIdx = semesters.findIndex((s) => ((s.year === year) && (s.semester === semester)));
    return (semesterIdx === 0);
  }

  _isLastSemester = (year, semester) => {
    const { semesters } = this.props;

    const semesterIdx = semesters.findIndex((s) => ((s.year === year) && (s.semester === semester)));
    return (semesterIdx === (semesters.length - 1));
  }

  changeToPreviousSemester() {
    const {
      semesters,
      year, semester,
      setSemesterDispatch,
    } = this.props;

    if (this._isFirstSemester(year, semester)) {
      return;
    }

    const semesterIdx = semesters.findIndex((s) => ((s.year === year) && (s.semester === semester)));
    const targetSemester = semesters[semesterIdx - 1];

    setSemesterDispatch(targetSemester.year, targetSemester.semester);

    ReactGA.event({
      category: 'Timetable - Semester',
      action: 'Switched Semester',
      label: `Semester : ${targetSemester.year}-${targetSemester.semester}`,
    });
  }

  changeToNextSemester() {
    const {
      semesters,
      year, semester,
      setSemesterDispatch,
    } = this.props;

    if (this._isLastSemester(year, semester)) {
      return;
    }

    const semesterIdx = semesters.findIndex((s) => ((s.year === year) && (s.semester === semester)));
    const targetSemester = semesters[semesterIdx + 1];

    setSemesterDispatch(targetSemester.year, targetSemester.semester);

    ReactGA.event({
      category: 'Timetable - Semester',
      action: 'Switched Semester',
      label: `Semester : ${targetSemester.year}-${targetSemester.semester}`,
    });
  }

  render() {
    const { t } = this.props;
    const { year, semester } = this.props;

    if (year && semester) {
      return (
        <div className={classNames('section', 'section--semester', t('jsx.className.semesterByLang'))}>
          <button className={classNames((this._isFirstSemester(year, semester) ? 'disable' : ''))} onClick={() => this.changeToPreviousSemester()}><i className={classNames('icon', 'icon--semester-prev')} /></button>
          <span>{`${year} ${getSemesterName(semester)}`}</span>
          <button className={classNames((this._isLastSemester(year, semester) ? 'disable' : ''))} onClick={() => this.changeToNextSemester()}><i className={classNames('icon', 'icon--semester-next')} /></button>
        </div>
      );
    }
    return (
      <div className={classNames('section', 'section--semester', t('jsx.className.semesterByLang'))}>
        <span className={classNames('placeholder')}>{t('ui.placeholder.loading')}</span>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  semesters: state.common.semester.semesters,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = (dispatch) => ({
  setSemesterDispatch: (year, semester) => {
    dispatch(setSemester(year, semester));
  },
});

SemesterSection.propTypes = {
  startSemester: semesterShape,

  semesters: PropTypes.arrayOf(semesterShape),
  year: PropTypes.number,
  semester: PropTypes.number,

  setSemesterDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SemesterSection));
