import React, { Component } from 'react';

import ReviewBlock from '../../blocks/ReviewBlock';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import Scroller from '../../Scroller';
import CourseSimpleBlock from '../../blocks/CourseSimpleBlock';
import CourseShape from '../../../shapes/CourseShape';
import courses from '../../../dummy/courses';


class CourseDetailSection extends Component {
  onScroll() {
    if (this.refs.scores.getBoundingClientRect().top >= this.refs.scrollThreshold.getBoundingClientRect().bottom) {
      this.refs.hiddenScores.classList.add('fixed__conditional-part--hidden');
    }
    else {
      this.refs.hiddenScores.classList.remove('fixed__conditional-part--hidden');
    }
  }


  render() {
    return (
      <div className="section-content section-content--flex section-content--course-detail">
        <div className="fixed">
          <div>
            <div className="title">
              {this.props.course.title}
            </div>
            <div className="subtitle">
              {this.props.course.old_code}
            </div>
          </div>
          <div ref="scrollThreshold" />
          <div className="fixed__conditional-part fixed__conditional-part--hidden" ref="hiddenScores">
            <div>
              <div className="scores">
                <div>
                  <div>
                    {this.props.course.grade_letter}
                  </div>
                  <div>
                    학점
                  </div>
                </div>
                <div>
                  <div>
                    {this.props.course.load_letter}
                  </div>
                  <div>
                    널널
                  </div>
                </div>
                <div>
                  <div>
                    {this.props.course.speech_letter}
                  </div>
                  <div>
                    강의
                  </div>
                </div>
              </div>
              <div className="divider" />
            </div>
          </div>
        </div>
        <Scroller onScroll={() => this.onScroll()}>
          <div className="attributes">
            <div>
              <div>
                분류
              </div>
              <div>
                {`${this.props.course.department.name}, ${this.props.course.type}`}
              </div>
            </div>
            <div>
              <div>
                설명
              </div>
              <div>
                {this.props.course.summary}
              </div>
            </div>
          </div>
          <div className="scores" ref="scores">
            <div>
              <div>
                {this.props.course.grade_letter}
              </div>
              <div>
                학점
              </div>
            </div>
            <div>
              <div>
                {this.props.course.load_letter}
              </div>
              <div>
                널널
              </div>
            </div>
            <div>
              <div>
                {this.props.course.speech_letter}
              </div>
              <div>
                강의
              </div>
            </div>
          </div>
          <div className="divider" />
          <div className="related-courses">
            <div>
              { courses.map(c => <CourseSimpleBlock course={c} />) }
            </div>
            <div>
              &gt;
            </div>
            <div>
              <CourseSimpleBlock course={this.props.course} />
            </div>
            <div>
              &gt;
            </div>
            <div>
              { courses.map(c => <CourseSimpleBlock course={c} />) }
            </div>
          </div>
          <div className="divider" />
          <ReviewWriteBlock />
          <ReviewBlock />
          <ReviewBlock />
          <ReviewBlock />
          <ReviewBlock />
        </Scroller>
      </div>
    );
  }
}

CourseDetailSection.propTypes = {
  course: CourseShape.isRequired,
};


export default CourseDetailSection;
