import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { syllabusBoundClassNames as classNames } from '../common/boundClassNames';

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
    const { lectures } = this.props.location.state;
    const { currentShowingLecture } = this.state;
    return (
      <div className={classNames('syllabus-page')}>
        <div className={classNames('syllabus-wrapper')}>
          <div className={classNames('lecture-tab-container')}>
            {
              lectures.map(lecture => (
                <div className={classNames('lecture-tab', (this.state.currentShowingLecture === lecture ? 'active' : ''))} onClick={() => this.updateShowingLecture(lecture)}>
                  { lecture.common_title }
                </div>
              ))
            }
          </div>
          <div className={classNames('syllabus-iframe-wrapper')}>
            { lectures.map(lecture => (
            //
              <iframe className={classNames('syllabus-iframe')} src={this.getLectureUrl(lecture)} title={`syllabus-${lecture.title}`} key={lecture.id} style={lecture.id === currentShowingLecture.id ? {} : { display: 'none' }}>
                { lecture.common_title }
              </iframe>
            ))}
          </div>
        </div>
      </div>

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
