import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import { reset as resetLectureFocus } from '../actions/timetable/lectureFocus';
import { reset as resetList } from '../actions/timetable/list';
import { reset as resetSearch } from '../actions/timetable/search';
import { reset as resetSemester } from '../actions/timetable/semester';
import {
  reset as resetTimetable,
  setSelectedTimetable, setMobileIsTimetableTabsOpen,
} from '../actions/timetable/timetable';

import LectureDetailSection from '../components/sections/timetable/LectureDetailSection';
import LectureListTabs from '../components/sections/timetable/LectureListTabs';
import LectureListSection from '../components/sections/timetable/LectureListSection';
import TimetableTabs from '../components/sections/timetable/TimetableTabs';
import SemesterSection from '../components/sections/timetable/SemesterSection';
import TimetableSubSection from '../components/sections/timetable/TimetableSubSection';
import MapSubSection from '../components/sections/timetable/MapSubSection';
import SummarySubSection from '../components/sections/timetable/SummarySubSection';
import ExamSubSection from '../components/sections/timetable/ExamSubSection';
import ShareSubSection from '../components/sections/timetable/ShareSubSection';

import lectureFocusShape from '../shapes/LectureFocusShape';
import semesterShape from '../shapes/SemesterShape';
import timetableShape from '../shapes/TimetableShape';
import userShape from '../shapes/UserShape';


class TimetablePage extends Component {
  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    const { startInMyTable } = this.props.location.state || {};
    const { user, myTimetable, setSelectedTimetableDispatch } = this.props;

    if (startInMyTable && user) {
      setSelectedTimetableDispatch(myTimetable);
    }
  }


  componentWillUnmount() {
    const {
      resetLectureFocusDispatch, resetListDispatch, resetSearchDispatch,
      resetSemesterDispatch, resetTimetableDispatch,
    } = this.props;

    resetLectureFocusDispatch();
    resetListDispatch();
    resetSearchDispatch();
    resetSemesterDispatch();
    resetTimetableDispatch();
  }


  render() {
    // eslint-disable-next-line react/destructuring-assignment
    const { startSemester } = this.props.location.state || {};
    const {
      lectureFocus,
      mobileIsTimetableTabsOpen, mobileIsLectureListOpen,
      setMobileIsTimetableTabsOpenDispatch,
    } = this.props;

    return (
      <>
        <section className={classNames('content', 'content--no-scroll', 'content--timetable')}>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--left', 'section-wrap--mobile-full', 'section-wrap--timetable-left', (mobileIsLectureListOpen ? '' : 'mobile-nosize'))}>
            <div className={classNames('section-wrap', 'section-wrap--lecture-detail', 'mobile-modal', (lectureFocus.clicked ? '' : 'mobile-hidden'))}>
              <div className={classNames('section')}>
                <LectureDetailSection />
              </div>
            </div>
            <div className={classNames('section-wrap', 'section-wrap--with-tabs', 'section-wrap--lecture-list', (mobileIsLectureListOpen ? '' : 'mobile-hidden'))}>
              <LectureListTabs />
              <div className={classNames('section', 'section--with-tabs', 'section--lecture-list')}>
                <LectureListSection />
              </div>
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--right', 'section-wrap--mobile-full', 'section-wrap--timetable-center-right')}>
            <div className={classNames('section-wrap', 'section-wrap--timetable-tabs', 'mobile-modal', (mobileIsTimetableTabsOpen ? '' : 'mobile-hidden'))}>
              <div>
                <div className={classNames('close-button-wrap')}>
                  <button onClick={() => setMobileIsTimetableTabsOpenDispatch(false)}>
                    <i className={classNames('icon', 'icon--close-section')} />
                  </button>
                </div>
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
                <div className={classNames('divider', (mobileIsLectureListOpen ? 'mobile-hidden' : ''))} />
                <ShareSubSection />
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  lectureFocus: state.timetable.lectureFocus,
  myTimetable: state.timetable.timetable.myTimetable,
  mobileIsTimetableTabsOpen: state.timetable.timetable.mobileIsTimetableTabsOpen,
  mobileIsLectureListOpen: state.timetable.list.mobileIsLectureListOpen,
});

const mapDispatchToProps = (dispatch) => ({
  setSelectedTimetableDispatch: (timetable) => {
    dispatch(setSelectedTimetable(timetable));
  },
  resetLectureFocusDispatch: () => {
    dispatch(resetLectureFocus());
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
  setMobileIsTimetableTabsOpenDispatch: (mobileIsTimetableTabsOpen) => {
    dispatch(setMobileIsTimetableTabsOpen(mobileIsTimetableTabsOpen));
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
  lectureFocus: lectureFocusShape.isRequired,
  myTimetable: timetableShape.isRequired,
  mobileIsTimetableTabsOpen: PropTypes.bool.isRequired,
  mobileIsLectureListOpen: PropTypes.bool.isRequired,

  setSelectedTimetableDispatch: PropTypes.func.isRequired,
  resetLectureFocusDispatch: PropTypes.func.isRequired,
  resetListDispatch: PropTypes.func.isRequired,
  resetSearchDispatch: PropTypes.func.isRequired,
  resetSemesterDispatch: PropTypes.func.isRequired,
  resetTimetableDispatch: PropTypes.func.isRequired,
  setMobileIsTimetableTabsOpenDispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimetablePage);
