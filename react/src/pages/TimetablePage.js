import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import { reset as resetLectureActive } from '../actions/timetable/lectureActive';
import { reset as resetList } from '../actions/timetable/list';
import { reset as resetSearch } from '../actions/timetable/search';
import { reset as resetSemester } from '../actions/timetable/semester';
import { reset as resetTimetable, setCurrentTimetable, setMobileShowTimetableTabs } from '../actions/timetable/timetable';

import LectureDetailSection from '../components/sections/timetable/LectureDetailSection';
import LectureListTabs from '../components/tabs/LectureListTabs';
import LectureListSection from '../components/sections/timetable/LectureListSection';
import TimetableTabs from '../components/tabs/TimetableTabs';
import SemesterSection from '../components/sections/timetable/SemesterSection';
import TimetableSubSection from '../components/sections/timetable/TimetableSubSection';
import MapSubSection from '../components/sections/timetable/MapSubSection';
import SummarySubSection from '../components/sections/timetable/SummarySubSection';
import ExamSubSection from '../components/sections/timetable/ExamSubSection';
import ShareSubSection from '../components/sections/timetable/ShareSubSection';

import lectureActiveShape from '../shapes/LectureActiveShape';
import semesterShape from '../shapes/SemesterShape';
import timetableShape from '../shapes/TimetableShape';
import userShape from '../shapes/UserShape';


class TimetablePage extends Component {
  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    const { startInMyTable } = this.props.location.state || {};
    const { user, myTimetable, setCurrentTimetableDispatch } = this.props;

    if (startInMyTable && user) {
      setCurrentTimetableDispatch(myTimetable);
    }
  }


  componentWillUnmount() {
    const { resetLectureActiveDispatch, resetListDispatch, resetSearchDispatch, resetSemesterDispatch, resetTimetableDispatch } = this.props;

    resetLectureActiveDispatch();
    resetListDispatch();
    resetSearchDispatch();
    resetSemesterDispatch();
    resetTimetableDispatch();
  }


  render() {
    // eslint-disable-next-line react/destructuring-assignment
    const { startSemester } = this.props.location.state || {};
    const { lectureActive, mobileShowTimetableTabs, mobileShowLectureList, setMobileShowTimetableTabsDispatch } = this.props;

    return (
      <>
        <section className={classNames('content', 'content--no-scroll', 'content--timetable')}>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--left', 'section-wrap--mobile-full', 'section-wrap--timetable-left', (mobileShowLectureList ? '' : 'mobile-nosize'))}>
            <div className={classNames('section-wrap', 'section-wrap--lecture-detail', 'mobile-modal', (lectureActive.clicked ? '' : 'mobile-hidden'))}>
              <div className={classNames('section')}>
                <LectureDetailSection />
              </div>
            </div>
            <div className={classNames('section-wrap', 'section-wrap--with-tabs', 'section-wrap--lecture-list', (mobileShowLectureList ? '' : 'mobile-hidden'))}>
              <LectureListTabs />
              <div className={classNames('section', 'section--with-tabs', 'section--lecture-list')}>
                <LectureListSection />
              </div>
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--right', 'section-wrap--mobile-full', 'section-wrap--timetable-center-right')}>
            <div className={classNames('section-wrap', 'section-wrap--timetable-tabs', 'mobile-modal', (mobileShowTimetableTabs ? '' : 'mobile-hidden'))}>
              <div>
                <button className={classNames('close-button')} onClick={() => setMobileShowTimetableTabsDispatch(false)}><i className={classNames('icon', 'icon--close-section')} /></button>
                <TimetableTabs />
                <SemesterSection startSemester={startSemester} />
              </div>
            </div>
            <div className={classNames('section', 'section--with-tabs', 'section--timetable')}>
              <TimetableSubSection />
              <div className={classNames('divider', 'divider--vertical', 'divider--mobile-horizontal')} />
              <div className={classNames('section-wrap', 'section-wrap--timetable-right')}>
                <MapSubSection />
                <div className={classNames('divider', 'mobile-hidden')} />
                <SummarySubSection />
                <div className={classNames('divider', 'mobile-hidden')} />
                <ExamSubSection />
                <div className={classNames('divider', (mobileShowLectureList ? 'mobile-hidden' : ''))} />
                <ShareSubSection />
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  lectureActive: state.timetable.lectureActive,
  myTimetable: state.timetable.timetable.myTimetable,
  mobileShowTimetableTabs: state.timetable.timetable.mobileShowTimetableTabs,
  mobileShowLectureList: state.timetable.list.mobileShowLectureList,
});

const mapDispatchToProps = dispatch => ({
  setCurrentTimetableDispatch: (timetable) => {
    dispatch(setCurrentTimetable(timetable));
  },
  resetLectureActiveDispatch: () => {
    dispatch(resetLectureActive());
  },
  resetListDispatch: () => {
    dispatch(resetList());
  },
  resetSearchDispatch: () => {
    dispatch(resetSearch());
  },
  resetSemesterDispatch: () => {
    dispatch(resetSemester());
  },
  resetTimetableDispatch: () => {
    dispatch(resetTimetable());
  },
  setMobileShowTimetableTabsDispatch: (mobileShowTimetableTabs) => {
    dispatch(setMobileShowTimetableTabs(mobileShowTimetableTabs));
  },
});


TimetablePage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      startSemester: semesterShape,
      startInMyTable: PropTypes.bool,
    }),
  }).isRequired,

  user: userShape,
  lectureActive: lectureActiveShape.isRequired,
  myTimetable: timetableShape.isRequired,
  mobileShowTimetableTabs: PropTypes.bool.isRequired,
  mobileShowLectureList: PropTypes.bool.isRequired,

  setCurrentTimetableDispatch: PropTypes.func.isRequired,
  resetLectureActiveDispatch: PropTypes.func.isRequired,
  resetListDispatch: PropTypes.func.isRequired,
  resetSearchDispatch: PropTypes.func.isRequired,
  resetSemesterDispatch: PropTypes.func.isRequired,
  resetTimetableDispatch: PropTypes.func.isRequired,
  setMobileShowTimetableTabsDispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimetablePage);
