import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import { setMobileShowTimetableTabs } from '../actions/timetable/index';
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

class TimetablePage extends Component {
  render() {
    const { lectureActive, mobileShowTimetableTabs, mobileShowLectureList, setMobileShowTimetableTabsDispatch } = this.props;
    return (
      <div>
        { /* */}
        <section className={classNames('content', 'content--no-scroll', 'content--timetable')}>
          { /* */}
          <div className={classNames('section-wrap', 'section-wrap--timetable-left', (mobileShowLectureList ? '' : 'mobile-nosize'))}>
            <div className={classNames('section-wrap', 'section-wrap--lecture-detail', 'mobile-modal', (lectureActive.clicked ? '' : 'mobile-hidden'))}>
              <div className={classNames('section')}>
                <LectureDetailSection />
              </div>
            </div>
            <div className={classNames('section-wrap', 'section-wrap--lecture-list', (mobileShowLectureList ? '' : 'mobile-hidden'))}>
              <LectureListTabs />
              <div className={classNames('section', 'section--with-tabs')}>
                <LectureListSection />
              </div>
            </div>
          </div>
          { /* */}
          <div className={classNames('section-wrap', 'section-wrap--timetable-center-right')}>
            <div className={classNames('section-wrap', 'section-wrap--timetable-tabs', 'mobile-modal', (mobileShowTimetableTabs ? '' : 'mobile-hidden'))}>
              <div>
                <div className={classNames('close-button')} onClick={() => setMobileShowTimetableTabsDispatch(false)}>닫기</div>
                <TimetableTabs />
                <SemesterSection />
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
      </div>
    );
  }
}

const mapStateToProps = state => ({
  lectureActive: state.timetable.lectureActive,
  mobileShowTimetableTabs: state.timetable.timetable.mobileShowTimetableTabs,
  mobileShowLectureList: state.timetable.list.mobileShowLectureList,
});

const mapDispatchToProps = dispatch => ({
  setMobileShowTimetableTabsDispatch: (mobileShowTimetableTabs) => {
    dispatch(setMobileShowTimetableTabs(mobileShowTimetableTabs));
  },
});


TimetablePage.propTypes = {
  lectureActive: lectureActiveShape.isRequired,
  mobileShowTimetableTabs: PropTypes.bool.isRequired,
  mobileShowLectureList: PropTypes.bool.isRequired,
  setMobileShowTimetableTabsDispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimetablePage);
