import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';
import CourseListSection from '../components/sections/dictionary/CourseListSection';
import CourseDetailSection from '../components/sections/dictionary/CourseDetailSection';
import CourseListTabs from '../components/tabs/CourseListTabs';
import courseActiveShape from '../shapes/CourseActiveShape';
import { setCourseActive } from '../actions/dictionary/courseActive';
import axios from '../common/presetAxios';
import { BASE_URL } from '../common/constants';


class DictionaryPage extends Component {
  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    const { startCourseId } = this.props.location.state || {};
    const { setCourseActiveDispatch } = this.props;

    if (startCourseId) {
      axios.get(`${BASE_URL}/api/courses/${startCourseId}`, {
      })
        .then((response) => {
          setCourseActiveDispatch(response.data, true);
        })
        .catch((response) => {
        });
    }
  }

  render() {
    const { courseActive } = this.props;

    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('section-wrap', 'section-wrap--course-list')}>
            <CourseListTabs />
            <div className={classNames('section', 'section--with-tabs')}>
              <CourseListSection />
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--course-detail', 'mobile-modal', ((courseActive.course && courseActive.clicked) ? '' : 'mobile-hidden'))}>
            <div className={classNames('section')}>
              <CourseDetailSection />
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = state => ({
  courseActive: state.dictionary.courseActive,
});

const mapDispatchToProps = dispatch => ({
  setCourseActiveDispatch: (lecture, clicked) => {
    dispatch(setCourseActive(lecture, clicked));
  },
});

DictionaryPage.propTypes = {
  courseActive: courseActiveShape.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      startCourseId: PropTypes.number.isRequired,
    }),
  }).isRequired,
  setCourseActiveDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(DictionaryPage);
