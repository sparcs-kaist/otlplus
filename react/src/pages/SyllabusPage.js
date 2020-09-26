import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import lectureShape from '../shapes/LectureShape';

import Scroller from '../components/Scroller';


class SyllabusPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLecture: this._getFirstLecture(props),
    };
  }

  _getFirstLecture = (props) => (
    props.location.state.lectures[0]
  )

  _getLectureUrl = (lecture) => (
    `https://cais.kaist.ac.kr/syllabusInfo?year=${lecture.year}&term=${lecture.semester}&subject_no=${lecture.code}&lecture_class=${lecture.class_no}&dept_id=${lecture.department}`
  )

  updateShowingLecture = (lecture) => {
    this.setState({ selectedLecture: lecture });
  }

  render() {
    // eslint-disable-next-line react/destructuring-assignment
    const { lectures } = this.props.location.state;
    const { selectedLecture } = this.state;

    return (
      <section className={classNames('content', 'content--no-scroll')}>
        <div className={classNames('section-wrap', 'section-wrap--with-tabs', 'section-wrap--syllabus')}>
          <div className={classNames('tabs', 'tabs--syllabus')}>
            <Scroller noScrollX={false} noScrollY={true}>
            {
              lectures.map((l) => (
                <div className={classNames('tabs__elem', (selectedLecture === l ? 'tabs__elem--selected' : ''))} onClick={() => this.updateShowingLecture(l)}>
                  { l.common_title }
                </div>
              ))
            }
            </Scroller>
          </div>
          <div className={classNames('section', 'section--syllabus')}>
            <div className={classNames('section-content', 'section-content--syllabus')}>

              { lectures.map((l) => (
                <iframe src={this._getLectureUrl(l)} title={`syllabus-${l.title}`} key={l.id} style={l.id === selectedLecture.id ? {} : { display: 'none' }}>
                  { l.common_title }
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
