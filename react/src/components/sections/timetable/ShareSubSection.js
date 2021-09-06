import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { setMobileIsLectureListOpen } from '../../../actions/timetable/list';
import { setMobileIsTimetableTabsOpen } from '../../../actions/timetable/timetable';

import timetableShape from '../../../shapes/TimetableShape';


class ShareSubSection extends Component {
  render() {
    const { t } = this.props;
    const {
      selectedTimetable,
      year, semester,
      mobileIsLectureListOpen,
      setMobileIsTimetableTabsOpenDispatch, setMobileIsLectureListOpenDispatch,
    } = this.props;

    const timetableLectures = selectedTimetable
      ? selectedTimetable.lectures
      : [];
    return (
      <div className={classNames('section-content--share', (mobileIsLectureListOpen ? 'mobile-hidden' : ''))}>
        <div>
          { selectedTimetable && year && semester
            ? (

              <>
                <a href={`/api/share/timetable/image?timetable=${selectedTimetable ? selectedTimetable.id : -1}&year=${year}&semester=${semester}`} download>
                  <i className={classNames('icon', 'icon--share-image')} />
                </a>
                <a style={{ display: 'none' }} href={`/api/share/timetable/calendar?timetable=${selectedTimetable ? selectedTimetable.id : -1}&year=${year}&semester=${semester}`} target="_blank" rel="noopener noreferrer">
                  <i className={classNames('icon', 'icon--share-googlecalendar')} />
                </a>
                <a href={`/api/share/timetable/ical?timetable=${selectedTimetable ? selectedTimetable.id : -1}&year=${year}&semester=${semester}`} download>
                  <i className={classNames('icon', 'icon--share-icalendar')} />
                </a>
                <Link to={{ pathname: '/timetable/syllabus', state: { lectures: timetableLectures } }}>
                  <i className={classNames('icon', 'icon--share-syllabus')} />
                </Link>
              </>
            )
            : (
              <>
                <span className={classNames('disabled')}><i className={classNames('icon', 'icon--share-image')} /></span>
                <span style={{ display: 'none' }} className={classNames('disabled')}><i className={classNames('icon', 'icon--share-googlecalendar')} /></span>
                <span className={classNames('disabled')}><i className={classNames('icon', 'icon--share-icalendar')} /></span>
                <span className={classNames('disabled')}><i className={classNames('icon', 'icon--share-syllabus')} /></span>
              </>
            )
          }

        </div>
        <div>
          <button onClick={() => setMobileIsTimetableTabsOpenDispatch(true)} className={classNames('text-button', 'text-button--black')}>
            <i className={classNames('icon', 'icon--switch-table')} />
            <span>{t('ui.button.switchTable')}</span>
          </button>
          <button onClick={() => setMobileIsLectureListOpenDispatch(true)} className={classNames('text-button', 'text-button--black')}>
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
  mobileIsLectureListOpen: state.timetable.list.mobileIsLectureListOpen,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = (dispatch) => ({
  setMobileIsTimetableTabsOpenDispatch: (mobileIsTimetableTabsOpen) => {
    dispatch(setMobileIsTimetableTabsOpen(mobileIsTimetableTabsOpen));
  },
  setMobileIsLectureListOpenDispatch: (mobileIsLectureListOpen) => {
    dispatch(setMobileIsLectureListOpen(mobileIsLectureListOpen));
  },
});

ShareSubSection.propTypes = {
  selectedTimetable: timetableShape,
  mobileIsLectureListOpen: PropTypes.bool.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,

  setMobileIsTimetableTabsOpenDispatch: PropTypes.func.isRequired,
  setMobileIsLectureListOpenDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ShareSubSection));
