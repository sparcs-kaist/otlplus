import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import LectureSearchSubSection from './LectureSearchSubSection';
import CourseLecturesBlock from '../../blocks/CourseLecturesBlock';

import { setLectureActive, clearLectureActive } from '../../../actions/timetable/lectureActive';
import { addLectureToCart, deleteLectureFromCart, setMobileShowLectureList } from '../../../actions/timetable/list';
import { openSearch } from '../../../actions/timetable/search';
import { addLectureToTimetable } from '../../../actions/timetable/timetable';

import { LIST } from '../../../reducers/timetable/lectureActive';

import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';
import lectureActiveShape from '../../../shapes/LectureActiveShape';

import { inTimetable, inCart, isListClicked, isListHover, isInactiveListLectures, performAddToTable, performAddToCart, performDeleteFromCart } from '../../../common/lectureFunctions';


class LectureListSection extends Component {
  constructor(props) {
    super(props);
    // eslint-disable-next-line fp/no-mutation
    this.arrowRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.selectWithArrow);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { currentList, lectureActive, mobileShowLectureList } = this.props;

    if ((currentList !== prevProps.currentList)
      || (mobileShowLectureList && !prevProps.mobileShowLectureList)) {
      this.selectWithArrow();
    }

    if (!lectureActive.clicked && prevProps.lectureActive.clicked) {
      this.selectWithArrow();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.selectWithArrow);
  }

  showSearch = () => {
    const { openSearchDispatch } = this.props;
    openSearchDispatch();
  }

  addToTable = lecture => (event) => {
    const { currentTimetable, user, currentList, addLectureToTimetableDispatch } = this.props;

    event.stopPropagation();
    performAddToTable(this, lecture, currentTimetable, user, addLectureToTimetableDispatch);

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['CART', 'Cart'],
    ]);
    ReactGA.event({
      category: 'Timetable - Lecture',
      action: 'Added Lecture to Timetable',
      label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(currentList) || currentList}`,
    });
  }

  addToCart = lecture => (event) => {
    const { year, semester, user, currentList, addLectureToCartDispatch } = this.props;

    event.stopPropagation();
    performAddToCart(this, lecture, year, semester, user, addLectureToCartDispatch);

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['CART', 'Cart'],
    ]);
    ReactGA.event({
      category: 'Timetable - Lecture',
      action: 'Added Lecture to Cart',
      label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(currentList) || currentList}`,
    });
  }

  deleteFromCart = lecture => (event) => {
    const { year, semester, user, currentList, deleteLectureFromCartDispatch } = this.props;

    event.stopPropagation();
    performDeleteFromCart(this, lecture, year, semester, user, deleteLectureFromCartDispatch);

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['CART', 'Cart'],
    ]);
    ReactGA.event({
      category: 'Timetable - Lecture',
      action: 'Deleted Lecture from Cart',
      label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(currentList) || currentList}`,
    });
  }

  listHover = lecture => () => {
    const { lectureActiveClicked, setLectureActiveDispatch } = this.props;

    const arrow = this.arrowRef.current;
    if (window.getComputedStyle(arrow).getPropertyValue('display') !== 'none') {
      return;
    }

    if (lectureActiveClicked) {
      return;
    }
    setLectureActiveDispatch(lecture, LIST, false);
  }

  listOut = () => {
    const { lectureActiveClicked, clearLectureActiveDispatch } = this.props;

    const arrow = this.arrowRef.current;
    if (window.getComputedStyle(arrow).getPropertyValue('display') !== 'none') {
      return;
    }

    if (lectureActiveClicked) {
      return;
    }
    clearLectureActiveDispatch();
  }

  listClick = lecture => () => {
    const { lectureActive, currentList, setLectureActiveDispatch } = this.props;

    if (!isListClicked(lecture, lectureActive)) {
      setLectureActiveDispatch(lecture, 'LIST', true);

      const labelOfTabs = new Map([
        ['SEARCH', 'Search'],
        ['HUMANITY', 'Humanity'],
        ['CART', 'Cart'],
      ]);
      ReactGA.event({
        category: 'Timetable - Selection',
        action: 'Selected Lecture',
        label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(currentList) || currentList}`,
      });
    }
    else {
      setLectureActiveDispatch(lecture, 'LIST', false);

      const labelOfTabs = new Map([
        ['SEARCH', 'Search'],
        ['HUMANITY', 'Humanity'],
        ['CART', 'Cart'],
      ]);
      ReactGA.event({
        category: 'Timetable - Selection',
        action: 'Unselected Lecture',
        label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(currentList) || currentList}`,
      });
    }
  }

  selectWithArrow = () => {
    const { currentList, clearLectureActiveDispatch, setLectureActiveDispatch } = this.props;

    const arrow = this.arrowRef.current;
    if (window.getComputedStyle(arrow).getPropertyValue('display') === 'none') {
      return;
    }

    const arrowPosition = (this.arrowRef.current).getBoundingClientRect();
    const arrowY = (arrowPosition.top + arrowPosition.bottom) / 2;

    const elementAtPosition = document.elementFromPoint(100, arrowY).closest(`.${classNames('block--course-lectures__elem-wrap')}`);
    if (elementAtPosition === null) {
      clearLectureActiveDispatch();
      return;
    }
    const targetId = Number(elementAtPosition.getAttribute('data-id'));
    const courses = this._getCourses(currentList);
    const targetLecture = courses
      .map(c => c.map(l => ((l.id === targetId) ? l : null)))
      .reduce((acc, val) => acc.concat(val), [])
      .filter(l => (l !== null))[0];
    setLectureActiveDispatch(targetLecture, 'LIST', false);
  }

  mobileCloseLectureList = () => {
    const { setMobileShowLectureListDispatch, clearLectureActiveDispatch } = this.props;

    setMobileShowLectureListDispatch(false);
    clearLectureActiveDispatch();
  }

  _getCourses = (currentList) => {
    const { search, major, humanity, cart } = this.props;

    if (currentList === 'SEARCH') {
      return search.courses;
    }
    if (major.codes.some(code => (currentList === code))) {
      return major[currentList].courses;
    }
    if (currentList === 'HUMANITY') {
      return humanity.courses;
    }
    if (currentList === 'CART') {
      return cart.courses;
    }
    return null;
  }

  render() {
    const { t } = this.props;
    const { lectureActive, currentTimetable, currentList, searchOpen, search, major, humanity, cart } = this.props;

    const mapCourses = (courses, fromCart) => {
      if (!courses) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>;
      }
      if (courses.length === 0) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>;
      }
      return [
        ...courses.map(course => (
          <div className={classNames('block', 'block--course-lectures', (course.some(lecture => isListClicked(lecture, lectureActive)) ? 'block--clicked' : ''), (isInactiveListLectures(course, lectureActive) ? 'block--inactive' : ''))} key={course[0].course}>
            <div className={classNames('block--course-lectures__title')}>
              <strong>{course[0][t('js.property.common_title')]}</strong>
              {' '}
              {course[0].old_code}
            </div>
            {course.map(lecture => (
              <CourseLecturesBlock
                lecture={lecture}
                key={lecture.id}
                isClicked={isListClicked(lecture, lectureActive)}
                isHover={isListHover(lecture, lectureActive)}
                inTimetable={inTimetable(lecture, currentTimetable)}
                isTimetableReadonly={!currentTimetable || Boolean(currentTimetable.isReadOnly)}
                inCart={inCart(lecture, cart)}
                fromCart={fromCart}
                addToCart={this.addToCart}
                addToTable={this.addToTable}
                deleteFromCart={this.deleteFromCart}
                listHover={this.listHover}
                listOut={this.listOut}
                listClick={this.listClick}
              />
            ))}
          </div>
        )),
        <div className={classNames('scroll-placeholder')} key="placeholder" />,
      ];
    };

    if (currentList === 'SEARCH') {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
          { searchOpen ? <LectureSearchSubSection /> : null }
          <button className={classNames('close-button')} onClick={this.mobileCloseLectureList}><i className={classNames('icon', 'icon--close-section')} /></button>
          <div className={classNames('title', 'title--search')} onClick={() => this.showSearch()}>
            <i className={classNames('icon', 'icon--search')} />
            <span>{t('ui.tab.search')}</span>
          </div>
          <>
            <div className={classNames('section-content--lecture-list__selector')} ref={this.arrowRef}>
              <i className={classNames('icon', 'icon--lecture-selector')} />
            </div>
            <Scroller onScroll={this.selectWithArrow} key={currentList}>
              {mapCourses(search.courses, false)}
            </Scroller>
          </>
        </div>
      );
    }
    if (major.codes.some(code => (currentList === code))) {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
          <button className={classNames('close-button')} onClick={this.mobileCloseLectureList}><i className={classNames('icon', 'icon--close-section')} /></button>
          <div className={classNames('title')}>
            {major[currentList][t('js.property.name')]}
          </div>
          <>
            <div className={classNames('section-content--lecture-list__selector')} ref={this.arrowRef}>
              <i className={classNames('icon', 'icon--lecture-selector')} />
            </div>
            <Scroller onScroll={this.selectWithArrow} key={currentList}>
              {mapCourses(major[currentList].courses, false)}
            </Scroller>
          </>
        </div>
      );
    }
    if (currentList === 'HUMANITY') {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
          <button className={classNames('close-button')} onClick={this.mobileCloseLectureList}><i className={classNames('icon', 'icon--close-section')} /></button>
          <div className={classNames('title')}>
            {t('ui.tab.humanity')}
          </div>
          <>
            <div className={classNames('section-content--lecture-list__selector')} ref={this.arrowRef}>
              <i className={classNames('icon', 'icon--lecture-selector')} />
            </div>
            <Scroller onScroll={this.selectWithArrow} key={currentList}>
              {mapCourses(humanity.courses, false)}
            </Scroller>
          </>
        </div>
      );
    }
    if (currentList === 'CART') {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
          <button className={classNames('close-button')} onClick={this.mobileCloseLectureList}><i className={classNames('icon', 'icon--close-section')} /></button>
          <div className={classNames('title')}>
            {t('ui.tab.wishlist')}
          </div>
          <>
            <div className={classNames('section-content--lecture-list__selector')} ref={this.arrowRef}>
              <i className={classNames('icon', 'icon--lecture-selector')} />
            </div>
            <Scroller onScroll={this.selectWithArrow} key={currentList}>
              {mapCourses(cart.courses, true)}
            </Scroller>
          </>
        </div>
      );
    }
    return null;
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  currentList: state.timetable.list.currentList,
  search: state.timetable.list.search,
  major: state.timetable.list.major,
  humanity: state.timetable.list.humanity,
  cart: state.timetable.list.cart,
  mobileShowLectureList: state.timetable.list.mobileShowLectureList,
  currentTimetable: state.timetable.timetable.currentTimetable,
  lectureActive: state.timetable.lectureActive,
  lectureActiveClicked: state.timetable.lectureActive.clicked,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
  searchOpen: state.timetable.search.open,
});

const mapDispatchToProps = dispatch => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  setLectureActiveDispatch: (lecture, from, clicked) => {
    dispatch(setLectureActive(lecture, from, clicked));
  },
  clearLectureActiveDispatch: () => {
    dispatch(clearLectureActive());
  },
  addLectureToTimetableDispatch: (lecture) => {
    dispatch(addLectureToTimetable(lecture));
  },
  addLectureToCartDispatch: (lecture) => {
    dispatch(addLectureToCart(lecture));
  },
  deleteLectureFromCartDispatch: (lecture) => {
    dispatch(deleteLectureFromCart(lecture));
  },
  setMobileShowLectureListDispatch: (mobileShowLectureList) => {
    dispatch(setMobileShowLectureList(mobileShowLectureList));
  },
});

LectureListSection.propTypes = {
  user: userShape,
  currentList: PropTypes.string.isRequired,
  search: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  major: PropTypes.shape({
    codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  humanity: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  cart: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  mobileShowLectureList: PropTypes.bool.isRequired,
  currentTimetable: timetableShape,
  lectureActive: lectureActiveShape.isRequired,
  lectureActiveClicked: PropTypes.bool.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,
  searchOpen: PropTypes.bool.isRequired,

  openSearchDispatch: PropTypes.func.isRequired,
  setLectureActiveDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
  addLectureToTimetableDispatch: PropTypes.func.isRequired,
  addLectureToCartDispatch: PropTypes.func.isRequired,
  deleteLectureFromCartDispatch: PropTypes.func.isRequired,
  setMobileShowLectureListDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureListSection));
