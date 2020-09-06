import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { setMobileShowLectureList } from '../../../actions/timetable/list';
import { setMobileShowTimetableTabs } from '../../../actions/timetable/timetable';

import timetableShape from '../../../shapes/TimetableShape';


class ShareSubSection extends Component {
  render() {
    const { t } = this.props;
    const { currentTimetable, mobileShowLectureList, year, semester, setMobileShowTimetableTabsDispatch, setMobileShowLectureListDispatch } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    return (
      <div className={classNames('section-content--share', (mobileShowLectureList ? 'mobile-hidden' : ''))}>
        <div>
          { currentTimetable && year && semester
            ? (

              <>
                <a href={`/api/share/timetable/image?timetable=${currentTimetable ? currentTimetable.id : -1}&year=${year}&semester=${semester}`} download><i className={classNames('icon', 'icon--share-image')} /></a>
                <a href={`/api/share/timetable/calendar?timetable=${currentTimetable ? currentTimetable.id : -1}&year=${year}&semester=${semester}`} target="_blank" rel="noopener noreferrer"><i className={classNames('icon', 'icon--share-calendar')} /></a>
                <Link to={{ pathname: '/timetable/syllabus', state: { lectures: timetableLectures } }}><i className={classNames('icon', 'icon--share-syllabus')} /></Link>
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
          <button onClick={() => setMobileShowTimetableTabsDispatch(true)} className={classNames('text-button', 'text-button--black')}>
            <i className={classNames('icon', 'icon--switch-table')} />
            <span>{t('ui.button.switchTable')}</span>
          </button>
          <button onClick={() => setMobileShowLectureListDispatch(true)} className={classNames('text-button', 'text-button--black')}>
            <i className={classNames('icon', 'icon--show-lectures')} />
            <span>{t('ui.button.showLectures')}</span>
          </button>
        </div>
        <div />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentTimetable: state.timetable.timetable.currentTimetable,
  mobileShowLectureList: state.timetable.list.mobileShowLectureList,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = dispatch => ({
  setMobileShowTimetableTabsDispatch: (mobileShowTimetableTabs) => {
    dispatch(setMobileShowTimetableTabs(mobileShowTimetableTabs));
  },
  setMobileShowLectureListDispatch: (mobileShowLectureList) => {
    dispatch(setMobileShowLectureList(mobileShowLectureList));
  },
});

ShareSubSection.propTypes = {
  currentTimetable: timetableShape,
  mobileShowLectureList: PropTypes.bool.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,

  setMobileShowTimetableTabsDispatch: PropTypes.func.isRequired,
  setMobileShowLectureListDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ShareSubSection));
