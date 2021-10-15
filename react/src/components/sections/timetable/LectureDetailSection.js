import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { getAverageScoreLabel } from '../../../utils/scoreUtils';

import Scroller from '../../Scroller';
import CloseButton from '../../CloseButton';
import ReviewSimpleBlock from '../../blocks/ReviewSimpleBlock';

import { clearLectureFocus, setReviews } from '../../../actions/timetable/lectureFocus';
import { addLectureToCart, deleteLectureFromCart } from '../../../actions/timetable/list';
import { addLectureToTimetable, removeLectureFromTimetable } from '../../../actions/timetable/timetable';

import { LectureFocusFrom } from '../../../reducers/timetable/lectureFocus';
import { LectureListCode } from '../../../reducers/timetable/list';

import userShape from '../../../shapes/UserShape';
import lectureFocusShape from '../../../shapes/LectureFocusShape';
import timetableShape from '../../../shapes/TimetableShape';

import {
  inTimetable, inCart,
  getProfessorsFullStr, getClassroomStr, getExamFullStr,
  getSyllabusUrl,
} from '../../../utils/lectureUtils';
import {
  performAddToTable, performDeleteFromTable, performAddToCart, performDeleteFromCart,
} from '../../../common/commonOperations';
import lectureListsShape from '../../../shapes/LectureListsShape';
import Divider from '../../Divider';
import OtlplusPlaceholder from '../../OtlplusPlaceholder';


class LectureDetailSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldShowCloseDict: false,
    };

    // eslint-disable-next-line fp/no-mutation
    this.openDictRef = React.createRef();
    // eslint-disable-next-line fp/no-mutation
    this.attributesRef = React.createRef();
    // eslint-disable-next-line fp/no-mutation
    this.scrollRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      isPortrait,
      lectureFocus, selectedListCode, selectedTimetable,
      year, semester,
      clearLectureFocusDispatch,
    } = this.props;

    if (prevProps.lectureFocus.clicked && lectureFocus.clicked) {
      if (prevProps.lectureFocus.lecture.id !== lectureFocus.lecture.id) {
        this._loadReviews();
        if (!isPortrait) {
          this.openDictPreview();
        }
      }
    }
    else if (prevProps.lectureFocus.clicked && !lectureFocus.clicked) {
      if (lectureFocus.lecture) {
        this.closeDictPreview();
      }
    }
    else if (!prevProps.lectureFocus.clicked && lectureFocus.clicked) {
      this._loadReviews();
      if (!isPortrait) {
        this.openDictPreview();
      }
    }

    if ((lectureFocus.from === LectureFocusFrom.LIST)
      && (prevProps.selectedListCode !== selectedListCode)) {
      clearLectureFocusDispatch();
    }
    else if ((lectureFocus.from === LectureFocusFrom.TABLE)
      && (prevProps.selectedTimetable.id !== selectedTimetable.id)) {
      clearLectureFocusDispatch();
    }
    else if ((prevProps.year !== year) || (prevProps.semester !== semester)) {
      clearLectureFocusDispatch();
    }
  }

  _loadReviews = () => {
    const LIMIT = 100;

    const { lectureFocus, setReviewsDispatch } = this.props;

    if (lectureFocus.reviews === null) {
      axios.get(
        `/api/lectures/${lectureFocus.lecture.id}/related-reviews`,
        {
          params: {
            order: ['-written_datetime', '-id'],
            limit: LIMIT,
          },
          metadata: {
            gaCategory: 'Lecture',
            gaVariable: 'GET Related Reviews / Instance',
          },
        },
      )
        .then((response) => {
          const newProps = this.props;
          if (newProps.lectureFocus.lecture.id !== lectureFocus.lecture.id) {
            return;
          }
          if (response.data === LIMIT) {
            // TODO: handle limit overflow
          }
          setReviewsDispatch(response.data);
        })
        .catch((error) => {
        });
    }
  }

  openDictPreview = () => {
    const scrollTop = this.openDictRef.current.getBoundingClientRect().top
      - this.attributesRef.current.getBoundingClientRect().top
      + 1;
    this.scrollRef.current.querySelector('.ScrollbarsCustom-Scroller').scrollTop = scrollTop;
  };

  closeDictPreview = () => {
    this.scrollRef.current.querySelector('.ScrollbarsCustom-Scroller').scrollTop = 0;
  };

  unfix = () => {
    const { clearLectureFocusDispatch } = this.props;
    clearLectureFocusDispatch();
  };

  addToTable = (event) => {
    const {
      user,
      lectureFocus, selectedListCode, selectedTimetable,
      addLectureToTimetableDispatch,
    } = this.props;

    event.stopPropagation();

    const labelOfTabs = new Map([
      [LectureListCode.SEARCH, 'Search'],
      [LectureListCode.BASIC, 'Basic'],
      [LectureListCode.HUMANITY, 'Humanity'],
      [LectureListCode.CART, 'Cart'],
    ]);
    const fromString = (lectureFocus.from === LectureFocusFrom.TABLE)
      ? 'Timetable'
      : (lectureFocus.from === LectureFocusFrom.LIST)
        ? `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`
        : 'Unknown';
    const beforeRequest = () => {
    };
    const afterResponse = () => {
      const newProps = this.props;
      if (!newProps.selectedTimetable || newProps.selectedTimetable.id !== selectedTimetable.id) {
        return;
      }
      // TODO: Fix timetable not updated when semester unchanged and timetable changed
      addLectureToTimetableDispatch(lectureFocus.lecture);
    };
    performAddToTable(
      lectureFocus.lecture, selectedTimetable, user, fromString,
      beforeRequest, afterResponse,
    );
  }

  deleteFromTable = (event) => {
    const {
      user,
      lectureFocus, selectedListCode, selectedTimetable,
      removeLectureFromTimetableDispatch,
    } = this.props;

    event.stopPropagation();

    const labelOfTabs = new Map([
      [LectureListCode.SEARCH, 'Search'],
      [LectureListCode.BASIC, 'Basic'],
      [LectureListCode.HUMANITY, 'Humanity'],
      [LectureListCode.CART, 'Cart'],
    ]);
    const fromString = (lectureFocus.from === LectureFocusFrom.TABLE)
      ? 'Timetable'
      : (lectureFocus.from === LectureFocusFrom.LIST)
        ? `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`
        : 'Unknown';
    const beforeRequest = () => {
    };
    const afterResponse = () => {
      const newProps = this.props;
      if (!newProps.selectedTimetable || newProps.selectedTimetable.id !== selectedTimetable.id) {
        return;
      }
      // TODO: Fix timetable not updated when semester unchanged and timetable changed
      removeLectureFromTimetableDispatch(lectureFocus.lecture);
    };
    performDeleteFromTable(
      lectureFocus.lecture, selectedTimetable, user, fromString,
      beforeRequest, afterResponse,
    );
  }

  addToCart = (event) => {
    const {
      user,
      lectureFocus, selectedListCode,
      year, semester,
      addLectureToCartDispatch,
    } = this.props;

    event.stopPropagation();

    const labelOfTabs = new Map([
      [LectureListCode.SEARCH, 'Search'],
      [LectureListCode.BASIC, 'Basic'],
      [LectureListCode.HUMANITY, 'Humanity'],
      [LectureListCode.CART, 'Cart'],
    ]);
    const fromString = (lectureFocus.from === LectureFocusFrom.TABLE)
      ? 'Timetable'
      : (lectureFocus.from === LectureFocusFrom.LIST)
        ? `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`
        : 'Unknown';
    const beforeRequest = () => {
    };
    const afterResponse = () => {
      const newProps = this.props;
      if (newProps.year !== year || newProps.semester !== semester) {
        return;
      }
      addLectureToCartDispatch(lectureFocus.lecture);
    };
    performAddToCart(
      lectureFocus.lecture, user, fromString,
      beforeRequest, afterResponse,
    );
  }

  deleteFromCart = (event) => {
    const {
      user,
      lectureFocus, selectedListCode,
      year, semester,
      deleteLectureFromCartDispatch,
    } = this.props;

    event.stopPropagation();

    const labelOfTabs = new Map([
      [LectureListCode.SEARCH, 'Search'],
      [LectureListCode.BASIC, 'Basic'],
      [LectureListCode.HUMANITY, 'Humanity'],
      [LectureListCode.CART, 'Cart'],
    ]);
    const fromString = (lectureFocus.from === LectureFocusFrom.TABLE)
      ? 'Timetable'
      : (lectureFocus.from === LectureFocusFrom.LIST)
        ? `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`
        : 'Unknown';
    const beforeRequest = () => {
    };
    const afterResponse = () => {
      const newProps = this.props;
      if (newProps.year !== year || newProps.semester !== semester) {
        return;
      }
      deleteLectureFromCartDispatch(lectureFocus.lecture);
    };
    performDeleteFromCart(
      lectureFocus.lecture, user, fromString,
      beforeRequest, afterResponse,
    );
  }

  onScroll = () => {
    const openDictElement = this.openDictRef.current;
    const scrollElement = openDictElement.closest('.ScrollbarsCustom-Scroller');

    const topOffset = (
      openDictElement.getBoundingClientRect().top - scrollElement.getBoundingClientRect().top
    );
    if (topOffset < 1.0) { // TODO: Change handing method for errors of 0.x differnce
      this.setState({ shouldShowCloseDict: true });
    }
    else {
      this.setState({ shouldShowCloseDict: false });
    }
  }


  render() {
    const { t } = this.props;
    const { shouldShowCloseDict } = this.state;
    const { lectureFocus, selectedTimetable, lists } = this.props;

    const shouldShowUnfix = (lectureFocus.from === LectureFocusFrom.LIST || lectureFocus.from === LectureFocusFrom.TABLE)
      && lectureFocus.clicked;

    const mapReviewToBlock = (review, index) => (
      <ReviewSimpleBlock
        key={`review_${index}`}
        review={review}
        linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: review.course.id }) }}
      />
    );

    const getSectionContent = () => {
      if (lectureFocus.from === LectureFocusFrom.LIST || lectureFocus.from === LectureFocusFrom.TABLE) {
        const reviewBlocks = (lectureFocus.reviews == null)
          ? <div className={classNames('list-placeholder', 'min-height-area')}><div>{t('ui.placeholder.loading')}</div></div>
          : (lectureFocus.reviews.length
            ? <div className={classNames('block-list', 'min-height-area')}>{lectureFocus.reviews.map(mapReviewToBlock)}</div>
            : <div className={classNames('list-placeholder', 'min-height-area')}><div>{t('ui.placeholder.noResults')}</div></div>);
        return (
        // eslint-disable-next-line react/jsx-indent
        <>
          <CloseButton onClick={this.unfix} />
          <div className={classNames('detail-title-area')}>
            <div className={classNames('title')}>
              {lectureFocus.lecture[t('js.property.title')]}
            </div>
            <div className={classNames('subtitle')}>
              {lectureFocus.lecture.old_code}
              {lectureFocus.lecture.class_no.length ? ` (${lectureFocus.lecture.class_no})` : ''}
            </div>
            <div className={classNames('buttons')}>
              <button onClick={this.unfix} className={classNames('text-button', (shouldShowUnfix ? '' : 'text-button--disabled'))}>{t('ui.button.unfix')}</button>
              <a className={classNames('text-button', 'text-button--right')} href={getSyllabusUrl(lectureFocus.lecture)} target="_blank" rel="noopener noreferrer">
                {t('ui.button.syllabus')}
              </a>
              <Link className={classNames('text-button', 'text-button--right')} to={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: lectureFocus.lecture.course }) }} target="_blank" rel="noopener noreferrer">
                {t('ui.button.dictionary')}
              </Link>
            </div>
          </div>
          <Scroller
            onScroll={this.onScroll}
            key={lectureFocus.lecture.id}
          >
            <div ref={this.attributesRef}>
              <div className={classNames('attribute')}>
                <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.attribute.type')}</span>
                <span>{lectureFocus.lecture[t('js.property.type')]}</span>
              </div>
              <div className={classNames('attribute')}>
                <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.attribute.department')}</span>
                <span>{lectureFocus.lecture[t('js.property.department_name')]}</span>
              </div>
              <div className={classNames('attribute')}>
                <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.attribute.professors')}</span>
                <span>{getProfessorsFullStr(lectureFocus.lecture)}</span>
              </div>
              <div className={classNames('attribute')}>
                <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.attribute.classroom')}</span>
                <span>{getClassroomStr(lectureFocus.lecture)}</span>
              </div>
              <div className={classNames('attribute')}>
                <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.attribute.limit')}</span>
                <span>{lectureFocus.lecture.limit}</span>
              </div>
              <div className={classNames('attribute')}>
                <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.attribute.exam')}</span>
                <span>{getExamFullStr(lectureFocus.lecture)}</span>
              </div>
            </div>
            <div className={classNames('scores')}>
              <div>
                {
                  lectureFocus.lecture.is_english
                    ? <div>Eng</div>
                    : <div className={(classNames('scores__score-text--korean'))}>한</div>
                }
                <div>{t('ui.score.language')}</div>
              </div>
              <div>
                {
                  lectureFocus.lecture.credit > 0
                    ? <div>{lectureFocus.lecture.credit}</div>
                    : <div>{lectureFocus.lecture.credit_au}</div>
                }
                {
                  lectureFocus.lecture.credit > 0
                    ? <div>{t('ui.score.credit')}</div>
                    : <div>AU</div>
                }
              </div>
              <div>
                <div>
                  {
                    lectureFocus.lecture.limit === 0
                      ? '0.0:1'
                      : `${(lectureFocus.lecture.num_people / lectureFocus.lecture.limit).toFixed(1).toString()}:1`
                  }
                </div>
                <div>{t('ui.score.competition')}</div>
              </div>
            </div>
            <div className={classNames('scores')}>
              <div>
                <div>{getAverageScoreLabel(lectureFocus.lecture.grade)}</div>
                <div>{t('ui.score.grade')}</div>
              </div>
              <div>
                <div>{getAverageScoreLabel(lectureFocus.lecture.load)}</div>
                <div>{t('ui.score.load')}</div>
              </div>
              <div>
                <div>{getAverageScoreLabel(lectureFocus.lecture.speech)}</div>
                <div>{t('ui.score.speech')}</div>
              </div>
            </div>
            { shouldShowCloseDict
              ? (
                <button className={classNames('small-title', 'top-sticky')} onClick={this.closeDictPreview} ref={this.openDictRef}>
                  <span>{t('ui.title.reviews')}</span>
                  <i className={classNames('icon', 'icon--lecture-uparrow')} />
                </button>
              )
              : (
                <button className={classNames('small-title', 'top-sticky')} onClick={this.openDictPreview} ref={this.openDictRef}>
                  <span>{t('ui.title.reviews')}</span>
                  <i className={classNames('icon', 'icon--lecture-downarrow')} />
                </button>
              )
            }
            { reviewBlocks }
          </Scroller>
          <Divider
            orientation={Divider.Orientation.HORIZONTAL}
            isVisible={{ desktop: false, mobile: true }}
          />
          <div className={classNames('subsection--lecture-detail__mobile-buttons', 'desktop-hidden')}>
            {
              !inCart(lectureFocus.lecture, lists[LectureListCode.CART])
                ? (
                  <button className={classNames('text-button', 'text-button--black')} onClick={this.addToCart}>
                    <i className={classNames('icon', 'icon--add-cart')} />
                    <span>{t('ui.button.addToWishlist')}</span>
                  </button>
                )
                : (
                  <button className={classNames('text-button', 'text-button--black')} onClick={this.deleteFromCart}>
                    <i className={classNames('icon', 'icon--delete-cart')} />
                    <span>{t('ui.button.deleteFromWishlist')}</span>
                  </button>
                )
            }
            {selectedTimetable && !selectedTimetable.isReadOnly
              ? (!inTimetable(lectureFocus.lecture, selectedTimetable)
                ? (
                  <button className={classNames('text-button', 'text-button--black')} onClick={this.addToTable}>
                    <i className={classNames('icon', 'icon--add-lecture')} />
                    <span>{t('ui.button.addToTable')}</span>
                  </button>
                )
                : (
                  <button className={classNames('text-button', 'text-button--black')} onClick={this.deleteFromTable}>
                    <i className={classNames('icon', 'icon--delete-from-table')} />
                    <span>{t('ui.button.deleteFromTable')}</span>
                  </button>
                )
              )
              : (!inTimetable(lectureFocus.lecture, selectedTimetable)
                ? (
                  <button className={classNames('text-button', 'text-button--black', 'text-button--disabled')}>
                    <i className={classNames('icon', 'icon--add-lecture')} />
                    <span>{t('ui.button.addToTable')}</span>
                  </button>
                )
                : (
                  <button className={classNames('text-button', 'text-button--black', 'text-button--disabled')}>
                    <i className={classNames('icon', 'icon--delete-from-table')} />
                    <span>{t('ui.button.deleteFromTable')}</span>
                  </button>
                )
              )
            }
          </div>
        </>
        );
      }
      if (lectureFocus.from === LectureFocusFrom.MULTIPLE) {
        return (
        // eslint-disable-next-line react/jsx-indent
        <>
          <div className={classNames('detail-title-area')}>
            <div className={classNames('title')}>
              {lectureFocus.multipleTitle}
            </div>
            <div className={classNames('subtitle')}>
              {t('ui.others.multipleDetailCount', { count: lectureFocus.multipleDetails.length })}
            </div>
            <div className={classNames('buttons')}>
              <span className={classNames('text-button', 'text-button--disabled')}>{t('ui.button.unfix')}</span>
              <span className={classNames('text-button', 'text-button--right', 'text-button--disabled')}>{t('ui.button.syllabus')}</span>
              <span className={classNames('text-button', 'text-button--right', 'text-button--disabled')}>{t('ui.button.dictionary')}</span>
            </div>
          </div>
          <div>
            {lectureFocus.multipleDetails.map((d, i) => (
              <div className={classNames('attribute', 'attribute--long-name')} key={d.lecture.id}>
                <span>
                  {d.name}
                </span>
                <span>
                  {d.info}
                </span>
              </div>
            ))}
          </div>
        </>
        );
      }
      return (
        <OtlplusPlaceholder />
      );
    };

    return (
      <div className={classNames('section', 'section--lecture-detail', 'section--mobile-modal', (lectureFocus.clicked ? '' : 'mobile-hidden'))}>
        <div className={classNames('subsection', 'subsection--lecture-detail', 'subsection--flex')} ref={this.scrollRef}>
          { getSectionContent() }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  isPortrait: state.common.media.isPortrait,
  lectureFocus: state.timetable.lectureFocus,
  selectedListCode: state.timetable.list.selectedListCode,
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  lists: state.timetable.list.lists,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = (dispatch) => ({
  clearLectureFocusDispatch: () => {
    dispatch(clearLectureFocus());
  },
  setReviewsDispatch: (reviews) => {
    dispatch(setReviews(reviews));
  },
  addLectureToTimetableDispatch: (lecture) => {
    dispatch(addLectureToTimetable(lecture));
  },
  removeLectureFromTimetableDispatch: (lecture) => {
    dispatch(removeLectureFromTimetable(lecture));
  },
  addLectureToCartDispatch: (lecture) => {
    dispatch(addLectureToCart(lecture));
  },
  deleteLectureFromCartDispatch: (lecture) => {
    dispatch(deleteLectureFromCart(lecture));
  },
});

LectureDetailSection.propTypes = {
  user: userShape,
  isPortrait: PropTypes.bool.isRequired,
  lectureFocus: lectureFocusShape.isRequired,
  selectedListCode: PropTypes.string.isRequired,
  selectedTimetable: timetableShape,
  lists: lectureListsShape.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,

  clearLectureFocusDispatch: PropTypes.func.isRequired,
  setReviewsDispatch: PropTypes.func.isRequired,
  addLectureToTimetableDispatch: PropTypes.func.isRequired,
  removeLectureFromTimetableDispatch: PropTypes.func.isRequired,
  addLectureToCartDispatch: PropTypes.func.isRequired,
  deleteLectureFromCartDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    LectureDetailSection
  )
);
