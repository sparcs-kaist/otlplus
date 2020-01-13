import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { setLectureSelected, clearLectureSelected } from '../../../actions/write-reviews/lectureSelected';
import Scroller from '../../Scroller2';
import LectureSimpleBlock from '../../blocks/LectureSimpleBlock';
import userShape from '../../../shapes/UserShape';
import semesterShape from '../../../shapes/SemesterShape';
import lectureShape from '../../../shapes/LectureShape';
import { isReviewWritablePlainYearSemester } from '../../../common/semesterFunctions';


class TakenLecturesSection extends Component {
  handleBlockClick = lecture => (e) => {
    const { selectedLecture, setLectureSelectedDispatch, clearLectureSelectedDispatch } = this.props;

    if (selectedLecture && (lecture.id === selectedLecture.id)) {
      clearLectureSelectedDispatch();
    }
    else {
      setLectureSelectedDispatch(lecture);
    }
  }


  render() {
    const { t } = this.props;
    const { user, semesters, selectedLecture } = this.props;

    if (!user) {
      return (
        <div className={classNames('section-content', 'section-content--taken-lectures')}>
          <Scroller>
            <div className={classNames('title')}>
              {t('ui.title.takenLectures')}
            </div>
            <div className={classNames('scores')}>
              <div>
                <div>
                  <span>-</span>
                  <span>/-</span>
                </div>
                <div>{t('ui.score.reviewsWritten')}</div>
              </div>
              <div>
                <div>
                  -
                </div>
                <div>{t('ui.score.likes')}</div>
              </div>
            </div>
            <div className={classNames('divider')} />
            <div className={classNames('list-placeholder')}>{t('ui.placeholder.noResults')}</div>
          </Scroller>
        </div>
      );
    }

    const takenSemesters = user.taken_lectures
      .map(l => ({
        year: l.year,
        semester: l.semester,
      }));
    // eslint-disable-next-line fp/no-mutating-methods
    const targetSemesters = takenSemesters
      .filter(s => isReviewWritablePlainYearSemester(semesters, s.year, s.semester))
      .filter((s, i) => ((takenSemesters.findIndex(s2 => (s2.year === s.year && s2.semester === s.semester))) === i))
      .sort((a, b) => ((a.year !== b.year) ? (b.year - a.year) : (b.semester - a.semester)));

    const semesterNames = [
      null,
      t('ui.semester.spring'),
      t('ui.semester.summer'),
      t('ui.semester.fall'),
      t('ui.semester.winter'),
    ];

    return (
      <div className={classNames('section-content', 'section-content--taken-lectures')}>
        <Scroller>
          <div className={classNames('title')}>
            {t('ui.title.takenLectures')}
          </div>
          <div className={classNames('scores')}>
            <div>
              <div>
                <span>{user.reviews.length}</span>
                <span>{`/${user.taken_lectures.length}`}</span>
              </div>
              <div>{t('ui.score.reviewsWritten')}</div>
            </div>
            <div>
              <div>
                {user.reviews.reduce((acc, r) => (acc + r.like), 0)}
              </div>
              <div>{t('ui.score.likes')}</div>
            </div>
          </div>
          {targetSemesters.length
            ? targetSemesters.map(s => (
              <React.Fragment key={`${s.year}-${s.semester}`}>
                <div className={classNames('divider')} />
                <div className={classNames('small-title')}>
                  {`${s.year} ${semesterNames[s.semester]}`}
                </div>
                <div className={classNames('taken-lectures')}>
                  {/* eslint-disable-next-line react/jsx-indent */}
                {user.taken_lectures
                  .filter(l => (l.year === s.year && l.semester === s.semester))
                  .map(l => (
                    !selectedLecture
                      ? (
                        <LectureSimpleBlock
                          key={l.id}
                          lecture={l}
                          isClicked={false}
                          isInactive={false}
                          hasReview={user.reviews.find(r => (r.lecture.id === l.id)) !== undefined}
                          onClick={this.handleBlockClick(l)}
                        />
                      )
                      : (
                        <LectureSimpleBlock
                          key={l.id}
                          lecture={l}
                          isClicked={selectedLecture.id === l.id}
                          isInactive={selectedLecture.id !== l.id}
                          hasReview={user.reviews.find(r => (r.lecture.id === l.id)) !== undefined}
                          onClick={this.handleBlockClick(l)}
                        />
                      )
                  ))
                }
                  <div className={classNames('taken-lectures__dummy')} />
                  <div className={classNames('taken-lectures__dummy')} />
                  <div className={classNames('taken-lectures__dummy')} />
                  <div className={classNames('taken-lectures__dummy')} />
                  <div className={classNames('taken-lectures__dummy')} />
                </div>
              </React.Fragment>
            ))
            : <div className={classNames('list-placeholder')}>{t('ui.placeholder.noResults')}</div>
          }
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  semesters: state.common.semester.semesters,
  selectedLecture: state.writeReviews.lectureSelected.lecture,
});

const mapDispatchToProps = dispatch => ({
  setLectureSelectedDispatch: (lecture) => {
    dispatch(setLectureSelected(lecture));
  },
  clearLectureSelectedDispatch: () => {
    dispatch(clearLectureSelected());
  },
});

TakenLecturesSection.propTypes = {
  user: userShape,
  semesters: PropTypes.arrayOf(semesterShape).isRequired,
  selectedLecture: lectureShape,
  setLectureSelectedDispatch: PropTypes.func.isRequired,
  clearLectureSelectedDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(TakenLecturesSection));
