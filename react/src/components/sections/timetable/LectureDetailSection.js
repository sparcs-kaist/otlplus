import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import qs from 'qs';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { getAverageScoreLabel } from '../../../common/scoreFunctions';

import Scroller from '../../Scroller';
import ReviewSimpleBlock from '../../blocks/ReviewSimpleBlock';

import { clearLectureFocus } from '../../../actions/timetable/lectureFocus';
import { addLectureToCart, deleteLectureFromCart } from '../../../actions/timetable/list';
import { addLectureToTimetable, removeLectureFromTimetable } from '../../../actions/timetable/timetable';

import { LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureFocus';

import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';
import lectureFocusShape from '../../../shapes/LectureFocusShape';
import timetableShape from '../../../shapes/TimetableShape';

import { inTimetable, inCart, getClassroomStr, performAddToTable, performDeleteFromTable, performAddToCart, performDeleteFromCart, getExamStr } from '../../../common/lectureFunctions';


class LectureDetailSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUnfix: false,
      showCloseDict: false,
      reviewsLecture: null,
      reviews: null,
    };

    // eslint-disable-next-line fp/no-mutation
    this.openDictRef = React.createRef();
    // eslint-disable-next-line fp/no-mutation
    this.attributesRef = React.createRef();
    // eslint-disable-next-line fp/no-mutation
    this.scrollRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const shouldClearReviews = (
      !nextProps.lectureFocus.lecture
      || !prevState.reviewsLecture
      || nextProps.lectureFocus.lecture.id !== prevState.reviewsLecture.id
    );
    return {
      showUnfix: (nextProps.lectureFocus.from === 'LIST' || nextProps.lectureFocus.from === 'TABLE') && nextProps.lectureFocus.clicked,
      reviews: shouldClearReviews
        ? null
        : prevState.reviews,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { lectureFocus, selectedListCode, selectedTimetable,
      year, semester, clearLectureFocusDispatch } = this.props;
    if (prevProps.lectureFocus.clicked && lectureFocus.clicked) {
      if (prevProps.lectureFocus.lecture.id !== lectureFocus.lecture.id) {
        this.openDictPreview();
      }
    }
    else if (prevProps.lectureFocus.clicked && !lectureFocus.clicked) {
      if (lectureFocus.lecture) {
        this.closeDictPreview();
      }
    }
    else if (!prevProps.lectureFocus.clicked && lectureFocus.clicked) {
      this.openDictPreview();
    }

    if ((lectureFocus.from === LIST) && (prevProps.selectedListCode !== selectedListCode)) {
      clearLectureFocusDispatch();
    }
    else if ((lectureFocus.from === TABLE) && (prevProps.selectedTimetable.id !== selectedTimetable.id)) {
      clearLectureFocusDispatch();
    }
    else if ((prevProps.year !== year) || (prevProps.semester !== semester)) {
      clearLectureFocusDispatch();
    }
  }

  openDictPreview = () => {
    const { reviews } = this.state;
    const { lectureFocus } = this.props;

    const scrollTop = this.openDictRef.current.getBoundingClientRect().top
      - this.attributesRef.current.getBoundingClientRect().top
      + 1;
    this.scrollRef.current.querySelector('.ScrollbarsCustom-Scroller').scrollTop = scrollTop;

    if (reviews === null) {
      axios.get(
        `/api/lectures/${lectureFocus.lecture.id}/related-reviews`,
        {
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
          this.setState({ reviewsLecture: lectureFocus.lecture, reviews: response.data });
        })
        .catch((error) => {
        });
    }
  };

  closeDictPreview = () => {
    this.scrollRef.current.querySelector('.ScrollbarsCustom-Scroller').scrollTop = 0;
  };

  unfix = () => {
    const { clearLectureFocusDispatch } = this.props;
    clearLectureFocusDispatch();
  };

  addToTable = (event) => {
    const { lectureFocus, selectedTimetable, user, selectedListCode,
      addLectureToTimetableDispatch } = this.props;

    event.stopPropagation();
    performAddToTable(this, lectureFocus.lecture, selectedTimetable, user, addLectureToTimetableDispatch);

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['CART', 'Cart'],
    ]);
    const fromString = (lectureFocus.from === TABLE)
      ? 'Timetable'
      : (lectureFocus.from === LIST)
        ? `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`
        : 'Unknown';
    ReactGA.event({
      category: 'Timetable - Lecture',
      action: 'Added Lecture to Timetable',
      label: `Lecture : ${lectureFocus.lecture.id} / From : ${fromString}`,
    });
  }

  deleteFromTable = (event) => {
    const { lectureFocus, selectedTimetable, user, selectedListCode,
      removeLectureFromTimetableDispatch } = this.props;

    event.stopPropagation();
    performDeleteFromTable(this, lectureFocus.lecture, selectedTimetable, user, removeLectureFromTimetableDispatch);

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['CART', 'Cart'],
    ]);
    const fromString = (lectureFocus.from === TABLE)
      ? 'Timetable'
      : (lectureFocus.from === LIST)
        ? `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`
        : 'Unknown';
    ReactGA.event({
      category: 'Timetable - Lecture',
      action: 'Deleted Lecture from Timetable',
      label: `Lecture : ${lectureFocus.lecture.id} / From : ${fromString}`,
    });
  }

  addToCart = (event) => {
    const { lectureFocus, year, semester, user, selectedListCode,
      addLectureToCartDispatch } = this.props;

    event.stopPropagation();
    performAddToCart(this, lectureFocus.lecture, year, semester, user, addLectureToCartDispatch);

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['CART', 'Cart'],
    ]);
    const fromString = (lectureFocus.from === TABLE)
      ? 'Timetable'
      : (lectureFocus.from === LIST)
        ? `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`
        : 'Unknown';
    ReactGA.event({
      category: 'Timetable - Lecture',
      action: 'Added Lecture to Cart',
      label: `Lecture : ${lectureFocus.lecture.id} / From : ${fromString}`,
    });
  }

  deleteFromCart = (event) => {
    const { lectureFocus, year, semester, user, selectedListCode,
      deleteLectureFromCartDispatch } = this.props;

    event.stopPropagation();
    performDeleteFromCart(this, lectureFocus.lecture, year, semester, user, deleteLectureFromCartDispatch);

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['CART', 'Cart'],
    ]);
    const fromString = (lectureFocus.from === TABLE)
      ? 'Timetable'
      : (lectureFocus.from === LIST)
        ? `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`
        : 'Unknown';
    ReactGA.event({
      category: 'Timetable - Lecture',
      action: 'Deleted Lecture from Cart',
      label: `Lecture : ${lectureFocus.lecture.id} / From : ${fromString}`,
    });
  }

  onScroll = () => {
    const openDictElement = this.openDictRef.current;
    const scrollElement = openDictElement.closest('.ScrollbarsCustom-Scroller');

    if (openDictElement.getBoundingClientRect().top - scrollElement.getBoundingClientRect().top < 1.0) { // TODO: Change handing method for errors of 0.x differnce
      this.setState({ showCloseDict: true });
    }
    else {
      this.setState({ showCloseDict: false });
    }
  }


  render() {
    const { t } = this.props;
    const { showUnfix, showCloseDict } = this.state;
    const { lectureFocus, selectedTimetable, cart } = this.props;

    if (lectureFocus.from === LIST || lectureFocus.from === TABLE) {
      const { reviews } = this.state;
      const mapreview = (review, index) => (
        <ReviewSimpleBlock key={`review_${index}`} review={review} />
      );
      const reviewsDom = (reviews == null)
        ? <div className={classNames('section-content--lecture-detail__list-area', 'list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>
        : (reviews.length
          ? <div className={classNames('section-content--lecture-detail__list-area')}>{reviews.map(mapreview)}</div>
          : <div className={classNames('section-content--lecture-detail__list-area', 'list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>);
      return (
        <div className={classNames('section-content', 'section-content--lecture-detail', 'section-content--flex')} ref={this.scrollRef}>
          <button className={classNames('close-button')} onClick={this.unfix}><i className={classNames('icon', 'icon--close-section')} /></button>
          <div className={classNames('title')}>
            {lectureFocus.lecture[t('js.property.title')]}
          </div>
          <div className={classNames('subtitle')}>
            {lectureFocus.lecture.old_code}
            {lectureFocus.lecture.class_no.length ? ` (${lectureFocus.lecture.class_no})` : ''}
          </div>
          <div className={classNames('buttons')}>
            <button onClick={this.unfix} className={classNames('text-button', (showUnfix ? '' : classNames('text-button--disabled')))}>{t('ui.button.unfix')}</button>
            <a className={classNames('text-button', 'text-button--right')} href={`https://cais.kaist.ac.kr/syllabusInfo?year=${lectureFocus.lecture.year}&term=${lectureFocus.lecture.semester}&subject_no=${lectureFocus.lecture.code}&lecture_class=${lectureFocus.lecture.class_no}&dept_id=${lectureFocus.lecture.department}`} target="_blank" rel="noopener noreferrer">
              {t('ui.button.syllabus')}
            </a>
            <Link className={classNames('text-button', 'text-button--right')} to={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: lectureFocus.lecture.course }) }}>
              {t('ui.button.dictionary')}
            </Link>
          </div>
          <div className={classNames('fixed__conditional-part', (showCloseDict ? '' : 'fixed__conditional-part--hidden'))}>
            <button className={classNames('small-title')} onClick={this.closeDictPreview}>
              <span>{t('ui.title.reviews')}</span>
              <i className={classNames('icon', 'icon--lecture-uparrow')} />
            </button>
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
                <span>{lectureFocus.lecture.professors.map(p => p[t('js.property.name')]).join(', ')}</span>
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
                <span>{getExamStr(lectureFocus.lecture)}</span>
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
            <button onClick={this.openDictPreview} className={classNames('small-title')} ref={this.openDictRef}>
              <span>{t('ui.title.reviews')}</span>
              <i className={classNames('icon', 'icon--lecture-downarrow')} />
            </button>
            {reviewsDom}
          </Scroller>
          <div className={classNames('divider', 'mobile-unhidden')} />
          <div className={classNames('section-content--lecture-detail__mobile-buttons', 'mobile-unhidden')}>
            {
              !inCart(lectureFocus.lecture, cart)
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
        </div>
      );
    }
    if (lectureFocus.from === MULTIPLE) {
      return (
        <div className={classNames('section-content', 'section-content--lecture-detail', 'section-content--flex')}>
          <div className={classNames('title')}>
            {lectureFocus.title}
          </div>
          <div className={classNames('subtitle')}>
            {t('ui.others.multipleDetailCount', { count: lectureFocus.multipleDetail.length })}
          </div>
          <div className={classNames('buttons')}>
            <span className={classNames('text-button', 'text-button--disabled')}>{t('ui.button.unfix')}</span>
            <span className={classNames('text-button', 'text-button--right', 'text-button--disabled')}>{t('ui.button.syllabus')}</span>
            <span className={classNames('text-button', 'text-button--right', 'text-button--disabled')}>{t('ui.button.dictionary')}</span>
          </div>
          <div>
            {lectureFocus.multipleDetail.map((detail, index) => (
              <div className={classNames('attribute')} key={detail.id}>
                <span>
                  {detail.title}
                </span>
                <span>
                  {detail.info}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className={classNames('section-content', 'section-content--lecture-detail', 'section-content--flex')}>
        <div className={classNames('otlplus-placeholder')}>
          <div>
            OTL PLUS
          </div>
          <div>
            <Link to="/credits/">{t('ui.menu.credit')}</Link>
            &nbsp;|&nbsp;
            <Link to="/licenses/">{t('ui.menu.licences')}</Link>
          </div>
          <div>
            <a href="mailto:otlplus@sparcs.org">otlplus@sparcs.org</a>
          </div>
          <div>
            © 2016,&nbsp;
            <a href="http://sparcs.org">SPARCS</a>
            &nbsp;OTL Team
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  lectureFocus: state.timetable.lectureFocus,
  selectedListCode: state.timetable.list.selectedListCode,
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  cart: state.timetable.list.cart,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = dispatch => ({
  clearLectureFocusDispatch: () => {
    dispatch(clearLectureFocus());
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
  lectureFocus: lectureFocusShape.isRequired,
  selectedListCode: PropTypes.string.isRequired,
  selectedTimetable: timetableShape,
  cart: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,

  clearLectureFocusDispatch: PropTypes.func.isRequired,
  addLectureToTimetableDispatch: PropTypes.func.isRequired,
  removeLectureFromTimetableDispatch: PropTypes.func.isRequired,
  addLectureToCartDispatch: PropTypes.func.isRequired,
  deleteLectureFromCartDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureDetailSection));
