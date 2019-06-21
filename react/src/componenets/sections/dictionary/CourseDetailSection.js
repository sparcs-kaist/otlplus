import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewBlock from '../../blocks/ReviewBlock';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import Scroller from '../../Scroller';
import CourseSimpleBlock from '../../blocks/CourseSimpleBlock';
import CourseShape from '../../../shapes/CourseShape';
import courses from '../../../dummy/courses';
import reviews from '../../../dummy/reviews';


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
    const { course } = this.props;

    return (
      <div className={classNames('section-content', 'section-content--flex', 'section-content--course-detail')}>
        <div className={classNames('fixed')}>
          <div>
            <div className={classNames('title')}>
              {course.title}
            </div>
            <div className={classNames('subtitle')}>
              {course.old_code}
            </div>
          </div>
          <div ref="scrollThreshold" />
          <div className={classNames('fixed__conditional-part', 'fixed__conditional-part--hidden')} ref="hiddenScores">
            <div>
              <div className={classNames('scores')}>
                <div>
                  <div>
                    {course.grade_letter}
                  </div>
                  <div>
                    학점
                  </div>
                </div>
                <div>
                  <div>
                    {course.load_letter}
                  </div>
                  <div>
                    널널
                  </div>
                </div>
                <div>
                  <div>
                    {course.speech_letter}
                  </div>
                  <div>
                    강의
                  </div>
                </div>
              </div>
              <div className={classNames('divider')} />
            </div>
          </div>
        </div>
        <Scroller onScroll={() => this.onScroll()}>
          <div className={classNames('attributes')}>
            <div>
              <div>
                분류
              </div>
              <div>
                {`${course.department.name}, ${course.type}`}
              </div>
            </div>
            <div>
              <div>
                설명
              </div>
              <div>
                {course.summary}
              </div>
            </div>
          </div>
          <div className={classNames('scores')} ref="scores">
            <div>
              <div>
                {course.grade_letter}
              </div>
              <div>
                학점
              </div>
            </div>
            <div>
              <div>
                {course.load_letter}
              </div>
              <div>
                널널
              </div>
            </div>
            <div>
              <div>
                {course.speech_letter}
              </div>
              <div>
                강의
              </div>
            </div>
          </div>
          <div className={classNames('divider')} />
          <div className={classNames('related-courses')}>
            <div>
              { courses.map(c => <CourseSimpleBlock course={c} key={c.id} />) }
            </div>
            <div>
              &gt;
            </div>
            <div>
              <CourseSimpleBlock course={course} />
            </div>
            <div>
              &gt;
            </div>
            <div>
              { courses.map(c => <CourseSimpleBlock course={c} key={c.id} />) }
            </div>
          </div>
          <div className={classNames('divider')} />
          <ReviewWriteBlock />
          {reviews.map(r => <ReviewBlock review={r} key={r.id} />)}
        </Scroller>
      </div>
    );
  }
}

CourseDetailSection.propTypes = {
  course: CourseShape.isRequired,
};


export default CourseDetailSection;
