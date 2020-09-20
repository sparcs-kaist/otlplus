import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { setMobileShouldShowLectureList } from '../../../actions/timetable/list';
import { setMobileShouldShowTimetableTabs } from '../../../actions/timetable/timetable';

import timetableShape from '../../../shapes/TimetableShape';


class ShareSubSection extends Component {
  render() {
    const { t } = this.props;
    const {
      selectedTimetable,
      year, semester,
      mobileShouldShowLectureList,
      setMobileShouldShowTimetableTabsDispatch, setMobileShouldShowLectureListDispatch,
    } = this.props;

    const timetableLectures = selectedTimetable
      ? selectedTimetable.lectures
      : [];
    return (
      <div className={classNames('section-content--share', (mobileShouldShowLectureList ? 'mobile-hidden' : ''))}>
        <div>
          { selectedTimetable && year && semester
            ? (

              <>
                <a href={`/api/share/timetable/image?timetable=${selectedTimetable ? selectedTimetable.id : -1}&year=${year}&semester=${semester}`} download>
                  <i className={classNames('icon', 'icon--share-image')} />
                </a>
                <a href={`/api/share/timetable/calendar?timetable=${selectedTimetable ? selectedTimetable.id : -1}&year=${year}&semester=${semester}`} target="_blank" rel="noopener noreferrer">
                  <i className={classNames('icon', 'icon--share-calendar')} />
                </a>
                <Link to={{ pathname: '/timetable/syllabus', state: { lectures: timetableLectures } }}>
                  <i className={classNames('icon', 'icon--share-syllabus')} />
                </Link>
              </>
            )
            : (
              <>
                <span className={classNames('disabled')}><i className={classNames('icon', 'icon--share-image')} /></span>
                <span className={classNames('disabled')}><i className={classNames('icon', 'icon--share-calendar')} /></span>
                <span className={classNames('disabled')}><i className={classNames('icon', 'icon--share-syllabus')} /></span>
              </>
            )
          }

        </div>
        <div>
          <button onClick={() => setMobileShouldShowTimetableTabsDispatch(true)} className={classNames('text-button', 'text-button--black')}>
            <i className={classNames('icon', 'icon--switch-table')} />
            <span>{t('ui.button.switchTable')}</span>
          </button>
          <button onClick={() => setMobileShouldShowLectureListDispatch(true)} className={classNames('text-button', 'text-button--black')}>
            <i className={classNames('icon', 'icon--show-lectures')} />
            <span>{t('ui.button.showLectures')}</span>
          </button>
        </div>
        <div />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  mobileShouldShowLectureList: state.timetable.list.mobileShouldShowLectureList,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = (dispatch) => ({
  setMobileShouldShowTimetableTabsDispatch: (mobileShouldShowTimetableTabs) => {
    dispatch(setMobileShouldShowTimetableTabs(mobileShouldShowTimetableTabs));
  },
  setMobileShouldShowLectureListDispatch: (mobileShouldShowLectureList) => {
    dispatch(setMobileShouldShowLectureList(mobileShouldShowLectureList));
  },
});

ShareSubSection.propTypes = {
  selectedTimetable: timetableShape,
  mobileShouldShowLectureList: PropTypes.bool.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,

  setMobileShouldShowTimetableTabsDispatch: PropTypes.func.isRequired,
  setMobileShouldShowLectureListDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ShareSubSection));
