import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import LectureSearchSubSection from './LectureSearchSubSection';

import { setLectureFocus, clearLectureFocus } from '../../../actions/timetable/lectureFocus';
import { addLectureToCart, deleteLectureFromCart, setMobileShowLectureList } from '../../../actions/timetable/list';
import { openSearch } from '../../../actions/timetable/search';
import { addLectureToTimetable } from '../../../actions/timetable/timetable';

import { LIST } from '../../../reducers/timetable/lectureFocus';

import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';
import lectureFocusShape from '../../../shapes/LectureFocusShape';

import { isListClicked, performAddToTable, performAddToCart, performDeleteFromCart } from '../../../common/lectureFunctions';
import LectureGroupBlock from '../../blocks/LectureGroupBlock';


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
    const { selectedListCode, lectureFocus, mobileShowLectureList } = this.props;

    if ((selectedListCode !== prevProps.selectedListCode)
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
    const { selectedTimetable, user, selectedListCode, addLectureToTimetableDispatch } = this.props;

    event.stopPropagation();
    performAddToTable(this, lecture, selectedTimetable, user, addLectureToTimetableDispatch);

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['CART', 'Cart'],
    ]);
    ReactGA.event({
      category: 'Timetable - Lecture',
      action: 'Added Lecture to Timetable',
      label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
    });
  }

  addToCart = lecture => (event) => {
    const { year, semester, user, selectedListCode, addLectureToCartDispatch } = this.props;

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
      label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
    });
  }

  deleteFromCart = lecture => (event) => {
    const { year, semester, user, selectedListCode, deleteLectureFromCartDispatch } = this.props;

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
      label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
    });
  }

  listHover = lecture => () => {
    const { lectureFocus, setLectureFocusDispatch } = this.props;

    const arrow = this.arrowRef.current;
    if (window.getComputedStyle(arrow).getPropertyValue('display') !== 'none') {
      return;
    }

    if (lectureFocus.clicked) {
      return;
    }
    setLectureFocusDispatch(lecture, LIST, false);
  }

  listOut = () => {
    const { lectureFocus, clearLectureFocusDispatch } = this.props;

    const arrow = this.arrowRef.current;
    if (window.getComputedStyle(arrow).getPropertyValue('display') !== 'none') {
      return;
    }

    if (lectureFocus.clicked) {
      return;
    }
    clearLectureFocusDispatch();
  }

  listClick = lecture => () => {
    const { lectureFocus, selectedListCode, setLectureFocusDispatch } = this.props;

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
        label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
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
        label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
      });
    }
  }

  selectWithArrow = () => {
    const { selectedListCode, clearLectureFocusDispatch, setLectureFocusDispatch } = this.props;

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
    const lectureGroups = this._getLectureGroups(selectedListCode);
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

  _getLectureGroups = (selectedListCode) => {
    const { search, major, humanity, cart } = this.props;

    if (selectedListCode === 'SEARCH') {
      return search.lectureGroups;
    }
    if (major.codes.some(code => (selectedListCode === code))) {
      return major[selectedListCode].lectureGroups;
    }
    if (selectedListCode === 'HUMANITY') {
      return humanity.lectureGroups;
    }
    if (selectedListCode === 'CART') {
      return cart.lectureGroups;
    }
    return null;
  }

  render() {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, selectedListCode, searchOpen, search, major, humanity, cart } = this.props;

    const getListElement = (lectureGroups, fromCart) => {
      if (!lectureGroups) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>;
      }
      if (lectureGroups.length === 0) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>;
      }
      return (
        <Scroller onScroll={this.selectWithArrow} key={selectedListCode}>
          {lectureGroups.map(lg => (
            <LectureGroupBlock
              lectureGroup={lg}
              key={lg[0].course}
              selectedTimetable={selectedTimetable}
              cart={cart}
              lectureFocus={lectureFocus}
              fromCart={fromCart}
              addToCart={this.addToCart}
              addToTable={this.addToTable}
              deleteFromCart={this.deleteFromCart}
              listHover={this.listHover}
              listOut={this.listOut}
              listClick={this.listClick}
            />
          ))
          }
        </Scroller>
      );
    };

    if (selectedListCode === 'SEARCH') {
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
    if (major.codes.some(code => (selectedListCode === code))) {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
          <button className={classNames('close-button')} onClick={this.mobileCloseLectureList}><i className={classNames('icon', 'icon--close-section')} /></button>
          <div className={classNames('title')}>
            {major[selectedListCode][t('js.property.name')]}
          </div>
          <>
            <div className={classNames('section-content--lecture-list__selector')} ref={this.arrowRef}>
              <i className={classNames('icon', 'icon--lecture-selector')} />
            </div>
            {getListElement(major[selectedListCode].lectureGroups, false)}
          </>
        </div>
      );
    }
    if (selectedListCode === 'HUMANITY') {
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
    if (selectedListCode === 'CART') {
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
  selectedListCode: state.timetable.list.selectedListCode,
  search: state.timetable.list.search,
  major: state.timetable.list.major,
  humanity: state.timetable.list.humanity,
  cart: state.timetable.list.cart,
  mobileShowLectureList: state.timetable.list.mobileShowLectureList,
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  lectureFocus: state.timetable.lectureFocus,
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
  selectedListCode: PropTypes.string.isRequired,
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
  selectedTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,
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
