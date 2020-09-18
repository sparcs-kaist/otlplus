import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import LectureSearchSubSection from './LectureSearchSubSection';
import LectureGroupBlockRow from '../../blocks/LectureGroupBlockRow';

import { setLectureFocus, clearLectureFocus } from '../../../actions/timetable/lectureFocus';
import { addLectureToCart, deleteLectureFromCart, setMobileShowLectureList } from '../../../actions/timetable/list';
import { openSearch } from '../../../actions/timetable/search';
import { addLectureToTimetable } from '../../../actions/timetable/timetable';

import { LIST } from '../../../reducers/timetable/lectureFocus';

import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';
import lectureFocusShape from '../../../shapes/LectureFocusShape';

import { inTimetable, inCart, isListClicked, isListHover, isDimmedListLectureGroup, performAddToTable, performAddToCart, performDeleteFromCart } from '../../../common/lectureFunctions';


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
    const { currentList, lectureFocus, mobileShowLectureList } = this.props;

    if ((currentList !== prevProps.currentList)
      || (mobileShowLectureList && !prevProps.mobileShowLectureList)) {
      this.selectWithArrow();
    }

    if (!lectureFocus.clicked && prevProps.lectureFocus.clicked) {
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
    const { lectureFocusClicked, setLectureFocusDispatch } = this.props;

    const arrow = this.arrowRef.current;
    if (window.getComputedStyle(arrow).getPropertyValue('display') !== 'none') {
      return;
    }

    if (lectureFocusClicked) {
      return;
    }
    setLectureFocusDispatch(lecture, LIST, false);
  }

  listOut = () => {
    const { lectureFocusClicked, clearLectureFocusDispatch } = this.props;

    const arrow = this.arrowRef.current;
    if (window.getComputedStyle(arrow).getPropertyValue('display') !== 'none') {
      return;
    }

    if (lectureFocusClicked) {
      return;
    }
    clearLectureFocusDispatch();
  }

  listClick = lecture => () => {
    const { lectureFocus, currentList, setLectureFocusDispatch } = this.props;

    if (!isListClicked(lecture, lectureFocus)) {
      setLectureFocusDispatch(lecture, 'LIST', true);

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
      setLectureFocusDispatch(lecture, 'LIST', false);

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
    const { currentList, clearLectureFocusDispatch, setLectureFocusDispatch } = this.props;

    const arrow = this.arrowRef.current;
    if (window.getComputedStyle(arrow).getPropertyValue('display') === 'none') {
      return;
    }

    const arrowPosition = (this.arrowRef.current).getBoundingClientRect();
    const arrowY = (arrowPosition.top + arrowPosition.bottom) / 2;

    const elementAtPosition = document.elementFromPoint(100, arrowY).closest(`.${classNames('block--lecture-group__elem-wrap')}`);
    if (elementAtPosition === null) {
      clearLectureFocusDispatch();
      return;
    }
    const targetId = Number(elementAtPosition.getAttribute('data-id'));
    const lectureGroups = this._getLectureGroups(currentList);
    const targetLecture = lectureGroups
      .map(lg => lg.map(l => ((l.id === targetId) ? l : null)))
      .reduce((acc, val) => acc.concat(val), [])
      .filter(l => (l !== null))[0];
    setLectureFocusDispatch(targetLecture, 'LIST', false);
  }

  mobileCloseLectureList = () => {
    const { setMobileShowLectureListDispatch, clearLectureFocusDispatch } = this.props;

    setMobileShowLectureListDispatch(false);
    clearLectureFocusDispatch();
  }

  _getLectureGroups = (currentList) => {
    const { search, major, humanity, cart } = this.props;

    if (currentList === 'SEARCH') {
      return search.lectureGroups;
    }
    if (major.codes.some(code => (currentList === code))) {
      return major[currentList].lectureGroups;
    }
    if (currentList === 'HUMANITY') {
      return humanity.lectureGroups;
    }
    if (currentList === 'CART') {
      return cart.lectureGroups;
    }
    return null;
  }

  render() {
    const { t } = this.props;
    const { lectureFocus, currentTimetable, currentList, searchOpen, search, major, humanity, cart } = this.props;

    const getListElement = (lectureGroups, fromCart) => {
      if (!lectureGroups) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>;
      }
      if (lectureGroups.length === 0) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>;
      }
      return (
        <Scroller onScroll={this.selectWithArrow} key={currentList}>
          {lectureGroups.map(lg => (
            <div className={classNames('block', 'block--lecture-group', (lg.some(l => isListClicked(l, lectureFocus)) ? 'block--clicked' : ''), (isDimmedListLectureGroup(lg, lectureFocus) ? 'block--dimmed' : ''))} key={lg[0].course}>
              <div className={classNames('block--lecture-group__title')}>
                <strong>{lg[0][t('js.property.common_title')]}</strong>
                {' '}
                {lg[0].old_code}
              </div>
              {lg.map(l => (
                <LectureGroupBlockRow
                  lecture={l}
                  key={l.id}
                  isClicked={isListClicked(l, lectureFocus)}
                  isHover={isListHover(l, lectureFocus)}
                  inTimetable={inTimetable(l, currentTimetable)}
                  isTimetableReadonly={!currentTimetable || Boolean(currentTimetable.isReadOnly)}
                  inCart={inCart(l, cart)}
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
          ))
          }
        </Scroller>
      );
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
            {getListElement(search.lectureGroups, false)}
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
            {getListElement(major[currentList].lectureGroups, false)}
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
            {getListElement(humanity.lectureGroups, false)}
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
            {getListElement(cart.lectureGroups, true)}
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
  lectureFocus: state.timetable.lectureFocus,
  lectureFocusClicked: state.timetable.lectureFocus.clicked,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
  searchOpen: state.timetable.search.open,
});

const mapDispatchToProps = dispatch => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  setLectureFocusDispatch: (lecture, from, clicked) => {
    dispatch(setLectureFocus(lecture, from, clicked));
  },
  clearLectureFocusDispatch: () => {
    dispatch(clearLectureFocus());
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
    lectureGroups: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  major: PropTypes.shape({
    codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  humanity: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  cart: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  mobileShowLectureList: PropTypes.bool.isRequired,
  currentTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,
  lectureFocusClicked: PropTypes.bool.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,
  searchOpen: PropTypes.bool.isRequired,

  openSearchDispatch: PropTypes.func.isRequired,
  setLectureFocusDispatch: PropTypes.func.isRequired,
  clearLectureFocusDispatch: PropTypes.func.isRequired,
  addLectureToTimetableDispatch: PropTypes.func.isRequired,
  addLectureToCartDispatch: PropTypes.func.isRequired,
  deleteLectureFromCartDispatch: PropTypes.func.isRequired,
  setMobileShowLectureListDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureListSection));
