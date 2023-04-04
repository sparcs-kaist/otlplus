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

import CloseButton from '../components/CloseButton';
import Divider from '../components/Divider';
import LectureDetailSection from '../components/sections/timetable/lecturedetail/LectureDetailSection';
import LectureListTabs from '../components/sections/timetable/lecturelist/LectureListTabs';
import LectureListSection from '../components/sections/timetable/lecturelist/LectureListSection';
import TimetableTabs from '../components/sections/timetable/timetableandinfos/TimetableTabs';
import SemesterSection from '../components/sections/timetable/semester/SemesterSection';
import TimetableSubSection from '../components/sections/timetable/timetableandinfos/TimetableSubSection';
import MapSubSection from '../components/sections/timetable/timetableandinfos/MapSubSection';
import SummarySubSection from '../components/sections/timetable/timetableandinfos/SummarySubSection';
import ExamSubSection from '../components/sections/timetable/timetableandinfos/ExamSubSection';
import ShareSubSection from '../components/sections/timetable/timetableandinfos/ShareSubSection';

import semesterShape from '../shapes/model/subject/SemesterShape';
import { myPseudoTimetableShape } from '../shapes/model/timetable/TimetableShape';
import userShape from '../shapes/model/session/UserShape';


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
      mobileIsTimetableTabsOpen, mobileIsLectureListOpen,
      setMobileIsTimetableTabsOpenDispatch,
    } = this.props;

    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div
            className={classNames(
              'page-grid',
              'page-grid--timetable',
              (mobileIsLectureListOpen ? 'page-grid--timetable--mobile-expanded' : null)
            )}
          >
            <LectureDetailSection />
            <LectureListTabs />
            <LectureListSection />
            <div className={classNames('section', 'section--semester-and-timetable-list', 'section--desktop-transparent', 'section--mobile-modal', (mobileIsTimetableTabsOpen ? null : 'mobile-hidden'))}>
              <CloseButton onClick={() => setMobileIsTimetableTabsOpenDispatch(false)} />
              <TimetableTabs />
              <SemesterSection startSemester={startSemester} />
            </div>
            <div className={classNames('section', 'section--timetable-and-infos')}>
              <TimetableSubSection />
              <Divider orientation={{ desktop: Divider.Orientation.VERTICAL, mobile: Divider.Orientation.HORIZONTAL }} isVisible={true} gridArea="divider-main" />
              <MapSubSection />
              <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: false }} gridArea="divider-sub-1" />
              <SummarySubSection />
              <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: false }} gridArea="divider-sub-2" />
              <ExamSubSection />
              <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: !mobileIsLectureListOpen }} gridArea="divider-sub-3" />
              <ShareSubSection />
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
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
  myTimetable: myPseudoTimetableShape.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(
  TimetablePage
);
