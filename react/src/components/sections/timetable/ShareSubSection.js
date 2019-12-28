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
    const { currentTimetable, mobileShowLectureList, setMobileShowTimetableTabsDispatch, setMobileShowLectureListDispatch } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    return (
      <div className={classNames('section-content--share', (mobileShowLectureList ? 'mobile-hidden' : ''))}>
        <div>
          <a href={`/api/timetable/share_image?table_id=${currentTimetable ? currentTimetable.id : -1}`} download><i className={classNames('icon', 'icon--share-image')} /></a>
          <a href={`/api/timetable/share_calendar?table_id=${currentTimetable ? currentTimetable.id : -1}`} target="_blank" rel="noopener noreferrer"><i className={classNames('icon', 'icon--share-calendar')} /></a>
          <Link to={{ pathname: '/timetable/syllabus', state: { lectures: timetableLectures } }}><i className={classNames('icon', 'icon--share-calendar')} /></Link>

        </div>
        <div>
          <button onClick={() => setMobileShowTimetableTabsDispatch(true)} className={classNames('text-button', 'text-button--black')}>
            <i className={classNames('icon', 'icon--switch-table')} />
            {t('ui.button.switchTable')}
          </button>
          <button onClick={() => setMobileShowLectureListDispatch(true)} className={classNames('text-button', 'text-button--black')}>
            <i className={classNames('icon', 'icon--show-lectures')} />
            {t('ui.button.showLectures')}
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
  setMobileShowTimetableTabsDispatch: PropTypes.func.isRequired,
  setMobileShowLectureListDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ShareSubSection));
