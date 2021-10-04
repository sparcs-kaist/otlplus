import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import CloseButton from '../../CloseButton';
import LectureSearchSubSection from './LectureSearchSubSection';
import LectureGroupBlock from '../../blocks/LectureGroupBlock';

import { setLectureFocus, clearLectureFocus } from '../../../actions/timetable/lectureFocus';
import { addLectureToCart, deleteLectureFromCart, setMobileIsLectureListOpen } from '../../../actions/timetable/list';
import { openSearch } from '../../../actions/timetable/search';
import { addLectureToTimetable } from '../../../actions/timetable/timetable';

import { LIST } from '../../../reducers/timetable/lectureFocus';
import {
  SEARCH, BASIC, HUMANITY, CART,
} from '../../../reducers/timetable/list';

import userShape from '../../../shapes/UserShape';
import lectureListsShape from '../../../shapes/LectureListsShape';
import timetableShape from '../../../shapes/TimetableShape';
import lectureFocusShape from '../../../shapes/LectureFocusShape';
import lectureLastSearchOptionShape from '../../../shapes/LectureLastSearchOptionShape';

import {
  isListClicked,
  performAddToTable, performAddToCart, performDeleteFromCart, isListFocused, inTimetable, inCart, isDimmedListLectureGroup,
} from '../../../utils/lectureUtils';
import { isTaken } from '../../../utils/courseUtils';

import {
  getLabelOfValue, getDepartmentOptions, getTypeOptions, getLevelOptions,
} from '../../../common/seachOptions';
import LectureGroupBlockRow from '../../blocks/LectureGroupBlockRow';


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
    const {
      lists, selectedListCode, lectureFocus, mobileIsLectureListOpen,
    } = this.props;

    if (selectedListCode !== prevProps.selectedListCode) {
      this.selectWithArrow();
    }
    if (!this._getLectureGroups(prevProps.selectedListCode, prevProps.lists)
      && this._getLectureGroups(selectedListCode, lists)) {
      this.selectWithArrow();
    }
    if (!prevProps.mobileIsLectureListOpen && mobileIsLectureListOpen) {
      this.selectWithArrow();
    }
    if (prevProps.lectureFocus.clicked && !lectureFocus.clicked) {
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

  addLectureToTable = (lecture) => {
    const {
      user,
      selectedTimetable, selectedListCode,
      addLectureToTimetableDispatch,
    } = this.props;

    const labelOfTabs = new Map([
      [SEARCH, 'Search'],
      [BASIC, 'Basic'],
      [HUMANITY, 'Humanity'],
      [CART, 'Cart'],
    ]);
    const fromString = `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`;
    performAddToTable(
      this,
      lecture, selectedTimetable, user, fromString,
      addLectureToTimetableDispatch
    );
  }

  addLectureToCart = (lecture) => {
    const {
      user,
      selectedListCode,
      year, semester,
      addLectureToCartDispatch,
    } = this.props;

    const labelOfTabs = new Map([
      [SEARCH, 'Search'],
      [BASIC, 'Basic'],
      [HUMANITY, 'Humanity'],
      [CART, 'Cart'],
    ]);
    const fromString = `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`;
    performAddToCart(
      this,
      lecture, year, semester, user, fromString,
      addLectureToCartDispatch
    );
  }

  deleteLectureFromCart = (lecture) => {
    const {
      user,
      selectedListCode,
      year, semester,
      deleteLectureFromCartDispatch,
    } = this.props;

    const labelOfTabs = new Map([
      [SEARCH, 'Search'],
      [BASIC, 'Basic'],
      [HUMANITY, 'Humanity'],
      [CART, 'Cart'],
    ]);
    const fromString = `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`;
    performDeleteFromCart(
      this,
      lecture, year, semester, user, fromString,
      deleteLectureFromCartDispatch
    );
  }

  focusLectureWithHover = (lecture) => {
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

  unfocusLectureWithHover = (lecture) => {
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

  focusLectureWIthClick = (lecture) => {
    const { lectureFocus, selectedListCode, setLectureFocusDispatch } = this.props;

    if (!isListClicked(lecture, lectureFocus)) {
      setLectureFocusDispatch(lecture, 'LIST', true);

      const labelOfTabs = new Map([
        [SEARCH, 'Search'],
        [BASIC, 'Basic'],
        [HUMANITY, 'Humanity'],
        [CART, 'Cart'],
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
        [SEARCH, 'Search'],
        [BASIC, 'Basic'],
        [HUMANITY, 'Humanity'],
        [CART, 'Cart'],
      ]);
      ReactGA.event({
        category: 'Timetable - Selection',
        action: 'Unselected Lecture',
        label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
      });
    }
  }

  selectWithArrow = () => {
    const {
      lists, selectedListCode,
      clearLectureFocusDispatch, setLectureFocusDispatch,
    } = this.props;

    const arrow = this.arrowRef.current;
    const arrowPosition = (this.arrowRef.current).getBoundingClientRect();
    const arrowY = (arrowPosition.top + arrowPosition.bottom) / 2;

    if (window.getComputedStyle(arrow).getPropertyValue('display') === 'none'
      || arrowY === 0) {
      return;
    }

    const elementAtPosition = (
      document.elementFromPoint(100, arrowY).closest(`.${classNames('block--lecture-group__elem-wrap')}`)
      || document.elementFromPoint(100, arrowY - 25).closest(`.${classNames('block--lecture-group__elem-wrap')}`)
      || document.elementFromPoint(100, arrowY + 25).closest(`.${classNames('block--lecture-group__elem-wrap')}`)
    );
    if (elementAtPosition === null) {
      clearLectureFocusDispatch();
      return;
    }
    const targetId = Number(elementAtPosition.getAttribute('data-id'));
    const lectureGroups = this._getLectureGroups(selectedListCode, lists);
    const targetLecture = lectureGroups
      .map((lg) => lg.map((l) => ((l.id === targetId) ? l : null)))
      .reduce((acc, val) => acc.concat(val), [])
      .filter((l) => (l !== null))[0];
    setLectureFocusDispatch(targetLecture, 'LIST', false);
  }

  mobileCloseLectureList = () => {
    const { setMobileIsLectureListOpenDispatch, clearLectureFocusDispatch } = this.props;

    setMobileIsLectureListOpenDispatch(false);
    clearLectureFocusDispatch();
  }

  _getLectureGroups = (selectedListCode, lists) => {
    if (!lists[selectedListCode]) {
      return null;
    }
    return lists[selectedListCode].lectureGroups;
  }

  render() {
    const { t } = this.props;
    const {
      user,
      lectureFocus, selectedTimetable, selectedListCode,
      searchOpen, lastSearchOption,
      lists,
      mobileIsLectureListOpen,
    } = this.props;

    const getListTitle = () => {
      if (selectedListCode === SEARCH) {
        const lastSearchOptionText = Object.entries(lastSearchOption)
          .map((e) => {
            if (e[0] === 'keyword' && e[1].length > 0) {
              return e[1];
            }
            if (e[0] === 'type' && !e[1].includes('ALL')) {
              return e[1].map((c) => getLabelOfValue(getTypeOptions(), c));
            }
            if (e[0] === 'department' && !e[1].includes('ALL')) {
              return e[1].map((c) => getLabelOfValue(getDepartmentOptions(), c));
            }
            if (e[0] === 'grade' && !e[1].includes('ALL')) {
              return e[1].map((c) => getLabelOfValue(getLevelOptions(), c));
            }
            return [];
          })
          .flat(1)
          .concat(
            (lastSearchOption.day && lastSearchOption.day !== '')
              ? [
                `${[t('ui.day.monday'), t('ui.day.tuesday'), t('ui.day.wednesday'), t('ui.day.thursday'), t('ui.day.friday')][lastSearchOption.day]} \
                ${8 + Math.floor(lastSearchOption.begin / 2)}:${['00', '30'][lastSearchOption.begin % 2]} ~ \
                ${8 + Math.floor(lastSearchOption.end / 2)}:${['00', '30'][lastSearchOption.end % 2]}`,
              ]
              : [],
          )
          .join(', ');
        return (
          <div className={classNames('title', 'title--search')} onClick={() => this.showSearch()}>
            <i className={classNames('icon', 'icon--search')} />
            <span>{t('ui.tab.search')}</span>
            <span>{lastSearchOptionText.length > 0 ? `:${lastSearchOptionText}` : ''}</span>
          </div>
        );
      }
      if (selectedListCode === BASIC) {
        return (
          <div className={classNames('title')}>
            {t('ui.tab.basic')}
          </div>
        );
      }
      if (user && user.departments.some((d) => (selectedListCode === d.code))) {
        const department = user.departments.find((d) => (selectedListCode === d.code));
        return (
          <div className={classNames('title')}>
            {`${department[t('js.property.name')]} ${t('ui.tab.major')}`}
          </div>
        );
      }
      if (selectedListCode === HUMANITY) {
        return (
          <div className={classNames('title')}>
            {t('ui.tab.humanity')}
          </div>
        );
      }
      if (selectedListCode === CART) {
        return (
          <div className={classNames('title')}>
            {t('ui.tab.wishlist')}
          </div>
        );
      }
      return null;
    };

    const getListElement = () => {
      const lectureGroups = this._getLectureGroups(selectedListCode, lists);
      if (!lectureGroups) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>;
      }
      if (lectureGroups.length === 0) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>;
      }
      return (
        <Scroller onScroll={this.selectWithArrow} key={selectedListCode}>
          <div className={classNames('block-list')}>
            {
              lectureGroups.map((lg) => (
                <LectureGroupBlock
                  lectureGroup={lg}
                  key={lg[0].course}
                  isRaised={lg.some((l) => isListClicked(l, lectureFocus))}
                  isDimmed={isDimmedListLectureGroup(lg, lectureFocus)}
                  isTaken={user && isTaken(lg[0].course, user)}
                >
                  {
                    lg.map((l) => (
                      <LectureGroupBlockRow
                        lecture={l}
                        key={l.id}
                        isRaised={isListClicked(l, lectureFocus) || isListFocused(l, lectureFocus)}
                        inTimetable={inTimetable(l, selectedTimetable)}
                        isTimetableReadonly={Boolean(!selectedTimetable || selectedTimetable.isReadOnly)}
                        inCart={inCart(l, lists[CART])}
                        fromCart={(selectedListCode === CART)}
                        addLectureToCart={this.addLectureToCart}
                        addLectureToTable={this.addLectureToTable}
                        deleteLectureFromCart={this.deleteLectureFromCart}
                        onMouseOver={this.focusLectureWithHover}
                        onMouseOut={this.unfocusLectureWithHover}
                        onClick={this.focusLectureWIthClick}
                      />
                    ))
                  }
                </LectureGroupBlock>
              ))
            }
          </div>
        </Scroller>
      );
    };

    return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('section', 'section--lecture-list', (mobileIsLectureListOpen ? '' : 'mobile-hidden'))}>
        <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
          { ((selectedListCode === SEARCH) && searchOpen) ? <LectureSearchSubSection /> : null }
          <CloseButton onClick={this.mobileCloseLectureList} />
          { getListTitle() }
          <div className={classNames('section-content--lecture-list__selector')} ref={this.arrowRef}>
            <i className={classNames('icon', 'icon--lecture-selector')} />
          </div>
          { getListElement() }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedListCode: state.timetable.list.selectedListCode,
  lists: state.timetable.list.lists,
  mobileIsLectureListOpen: state.timetable.list.mobileIsLectureListOpen,
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  lectureFocus: state.timetable.lectureFocus,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
  searchOpen: state.timetable.search.open,
  lastSearchOption: state.timetable.search.lastSearchOption,
});

const mapDispatchToProps = (dispatch) => ({
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
  setMobileIsLectureListOpenDispatch: (mobileIsLectureListOpen) => {
    dispatch(setMobileIsLectureListOpen(mobileIsLectureListOpen));
  },
});

LectureListSection.propTypes = {
  user: userShape,
  selectedListCode: PropTypes.string.isRequired,
  lists: lectureListsShape.isRequired,
  mobileIsLectureListOpen: PropTypes.bool.isRequired,
  selectedTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,
  searchOpen: PropTypes.bool.isRequired,
  lastSearchOption: lectureLastSearchOptionShape.isRequired,

  openSearchDispatch: PropTypes.func.isRequired,
  setLectureFocusDispatch: PropTypes.func.isRequired,
  clearLectureFocusDispatch: PropTypes.func.isRequired,
  addLectureToTimetableDispatch: PropTypes.func.isRequired,
  addLectureToCartDispatch: PropTypes.func.isRequired,
  deleteLectureFromCartDispatch: PropTypes.func.isRequired,
  setMobileIsLectureListOpenDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    LectureListSection
  )
);
