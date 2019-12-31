import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import lectureShape from '../shapes/LectureShape';


class SyllabusPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentShowingLecture: this.getFirstLecture(props),
    };
  }

  getFirstLecture = props => (
    props.location.state.lectures[0]
  )

  getLectureUrl = lecture => (
    `https://cais.kaist.ac.kr/syllabusInfo?year=${lecture.year}&term=${lecture.semester}&subject_no=${lecture.code}&lecture_class=${lecture.class_no}&dept_id=${lecture.department}`
  )

  updateShowingLecture = (lecture) => {
    this.setState({ currentShowingLecture: lecture });
  }

  render() {
    // eslint-disable-next-line react/destructuring-assignment
    const { lectures } = this.props.location.state;
    const { currentShowingLecture } = this.state;

    return (
      <section className={classNames('content', 'content--no-scroll')}>
        <div className={classNames('section-wrap', 'section-wrap--with-tabs', 'section-wrap--syllabus')}>
          <div className={classNames('tabs', 'tabs--syllabus')}>
            {
              lectures.map(lecture => (
                <button className={classNames((currentShowingLecture === lecture ? 'tabs__elem--active' : ''))} onClick={() => this.updateShowingLecture(lecture)}>
                  { lecture.common_title }
                </button>
              ))
            }
          </div>
          <div className={classNames('section', 'section--syllabus')}>
            <div className={classNames('section-content', 'section-content--syllabus')}>
              {/* eslint-disable-next-line react/jsx-indent */}
            { lectures.map(lecture => (
              <iframe src={this.getLectureUrl(lecture)} title={`syllabus-${lecture.title}`} key={lecture.id} style={lecture.id === currentShowingLecture.id ? {} : { display: 'none' }}>
                { lecture.common_title }
              </iframe>
            ))}
            </div>
          </div>
        </div>
      </section>

    );
  }
}

SyllabusPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      lectures: PropTypes.arrayOf(lectureShape),
    }).isRequired,
  }).isRequired,
};

export default SyllabusPage;
