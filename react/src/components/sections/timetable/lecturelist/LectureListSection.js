import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Scroller from '../../../Scroller';
import CloseButton from '../../../CloseButton';
import LectureSearchSubSection from './LectureSearchSubSection';
import LectureGroupBlock from '../../../blocks/LectureGroupBlock';

import { setLectureFocus, clearLectureFocus } from '../../../../actions/timetable/lectureFocus';
import { addLectureToCart, deleteLectureFromCart, setMobileIsLectureListOpen } from '../../../../actions/timetable/list';
import { openSearch } from '../../../../actions/timetable/search';
import { addLectureToTimetable } from '../../../../actions/timetable/timetable';

import { LectureFocusFrom } from '../../../../reducers/timetable/lectureFocus';
import { LectureListCode } from '../../../../reducers/timetable/list';

import userShape from '../../../../shapes/model/session/UserShape';
import lectureListsShape from '../../../../shapes/state/timetable/LectureListsShape';
import timetableShape, { myPseudoTimetableShape } from '../../../../shapes/model/timetable/TimetableShape';
import lectureFocusShape from '../../../../shapes/state/timetable/LectureFocusShape';
import lectureLastSearchOptionShape from '../../../../shapes/state/timetable/LectureLastSearchOptionShape';

import {
  isListClicked,
  isListFocused, inTimetable, inCart, isDimmedListLectureGroup,
} from '../../../../utils/lectureUtils';
import {
  performAddToTable, performAddToCart, performDeleteFromCart,
} from '../../../../common/commonOperations';
import { isTaken } from '../../../../utils/courseUtils';
import { getRangeStr } from '../../../../utils/timeUtils';

import {
  getLabelOfValue, getDepartmentOptions, getTypeOptions, getLevelOptions,
} from '../../../../common/searchOptions';
import LectureGroupBlockRow from '../../../blocks/LectureGroupBlockRow';
import { TIMETABLE_START_HOUR } from '../../../../common/constants';


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
    if (prevProps.lectureFocus.clicked && !lectureFocus.clicked) {
      this.selectWithArrow();
    }
    if (!prevProps.mobileIsLectureListOpen && mobileIsLectureListOpen) {
      const TOTAL_DURATION = 0.15;
      const INTERVAL = 0.05;

      range(TOTAL_DURATION / INTERVAL + 1).forEach((i) => {
        const millis = (i + 2) * 0.05 * 1000;
        window.setTimeout(this.selectWithArrow, millis);
      });
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
      [LectureListCode.SEARCH, 'Search'],
      [LectureListCode.BASIC, 'Basic'],
      [LectureListCode.HUMANITY, 'Humanity'],
      [LectureListCode.CART, 'Cart'],
    ]);
    const fromString = `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`;
    const beforeRequest = () => {
    };
    const afterResponse = () => {
      const newProps = this.props;
      if (!newProps.selectedTimetable || newProps.selectedTimetable.id !== selectedTimetable.id) {
        return;
      }
      // TODO: Fix timetable not updated when semester unchanged and timetable changed
      addLectureToTimetableDispatch(lecture);
    };
    performAddToTable(
      lecture, selectedTimetable, user, fromString,
      beforeRequest, afterResponse,
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
      [LectureListCode.SEARCH, 'Search'],
      [LectureListCode.BASIC, 'Basic'],
      [LectureListCode.HUMANITY, 'Humanity'],
      [LectureListCode.CART, 'Cart'],
    ]);
    const fromString = `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`;
    const beforeRequest = () => {
    };
    const afterResponse = () => {
      const newProps = this.props;
      if (newProps.year !== year || newProps.semester !== semester) {
        return;
      }
      addLectureToCartDispatch(lecture);
    };
    performAddToCart(
      lecture, user, fromString,
      beforeRequest, afterResponse,
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
      [LectureListCode.SEARCH, 'Search'],
      [LectureListCode.BASIC, 'Basic'],
      [LectureListCode.HUMANITY, 'Humanity'],
      [LectureListCode.CART, 'Cart'],
    ]);
    const fromString = `Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`;
    const beforeRequest = () => {
    };
    const afterResponse = () => {
      const newProps = this.props;
      if (newProps.year !== year || newProps.semester !== semester) {
        return;
      }
      deleteLectureFromCartDispatch(lecture);
    };
    performDeleteFromCart(
      lecture, user, fromString,
      beforeRequest, afterResponse,
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
    setLectureFocusDispatch(lecture, LectureFocusFrom.LIST, false);
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

  focusLectureWithClick = (lecture) => {
    const { lectureFocus, selectedListCode, setLectureFocusDispatch } = this.props;

    if (!isListClicked(lecture, lectureFocus)) {
      setLectureFocusDispatch(lecture, LectureFocusFrom.LIST, true);

      const labelOfTabs = new Map([
        [LectureListCode.SEARCH, 'Search'],
        [LectureListCode.BASIC, 'Basic'],
        [LectureListCode.HUMANITY, 'Humanity'],
        [LectureListCode.CART, 'Cart'],
      ]);
      ReactGA.event({
        category: 'Timetable - Selection',
        action: 'Selected Lecture',
        label: `Lecture : ${lecture.id} / From : Lecture List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
      });
    }
    else {
      setLectureFocusDispatch(lecture, LectureFocusFrom.LIST, false);

      const labelOfTabs = new Map([
        [LectureListCode.SEARCH, 'Search'],
        [LectureListCode.BASIC, 'Basic'],
        [LectureListCode.HUMANITY, 'Humanity'],
        [LectureListCode.CART, 'Cart'],
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
      lectureFocus,
      clearLectureFocusDispatch, setLectureFocusDispatch,
    } = this.props;

    if (lectureFocus.clicked) {
      return;
    }

    const arrow = this.arrowRef.current;
    const arrowPosition = (this.arrowRef.current).getBoundingClientRect();
    const arrowX = arrowPosition.left;
    const arrowY = (arrowPosition.top + arrowPosition.bottom) / 2;

    if (window.getComputedStyle(arrow).getPropertyValue('display') === 'none'
      || arrowY === 0) {
      return;
    }

    const elementsAtPosition = [
      document.elementFromPoint(arrowX - 15, arrowY),
      document.elementFromPoint(arrowX - 15, arrowY - 25),
      document.elementFromPoint(arrowX - 15, arrowY + 25),
    ];
    const targetElements = elementsAtPosition.filter((e) => (e && e.closest(`.${classNames('block--lecture-group__row')}`)));
    if (targetElements.length === 0) {
      clearLectureFocusDispatch();
      return;
    }
    const targetId = Number(targetElements[0].closest(`.${classNames('block--lecture-group__row')}`).dataset.id);
    const lectureGroups = this._getLectureGroups(selectedListCode, lists);
    const targetLecture = lectureGroups
      .map((lg) => lg.map((l) => ((l.id === targetId) ? l : null)))
      .flat(1)
      .filter((l) => (l !== null))[0];
    setLectureFocusDispatch(targetLecture, LectureFocusFrom.LIST, false);
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
      lastSearchOption,
      lists,
    } = this.props;

    const getListTitle = () => {
      if (selectedListCode === LectureListCode.SEARCH) {
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
                `${getRangeStr(
                  lastSearchOption.day,
                  (lastSearchOption.begin + TIMETABLE_START_HOUR * 2) * 30,
                  (lastSearchOption.end + TIMETABLE_START_HOUR * 2) * 30
                )}`,
              ]
              : [],
          )
          .join(', ');
        return (
          <div className={classNames('list-title', 'list-title--search')} onClick={() => this.showSearch()}>
            <i className={classNames('icon', 'icon--search')} />
            <span>{t('ui.tab.search')}</span>
            <span>{lastSearchOptionText.length > 0 ? `:${lastSearchOptionText}` : ''}</span>
          </div>
        );
      }
      if (selectedListCode === LectureListCode.BASIC) {
        return (
          <div className={classNames('list-title')}>
            {t('ui.tab.basic')}
          </div>
        );
      }
      if (user && user.departments.some((d) => (selectedListCode === d.code))) {
        const department = user.departments.find((d) => (selectedListCode === d.code));
        return (
          <div className={classNames('list-title')}>
            {`${department[t('js.property.name')]} ${t('ui.tab.major')}`}
          </div>
        );
      }
      if (selectedListCode === LectureListCode.HUMANITY) {
        return (
          <div className={classNames('list-title')}>
            {t('ui.tab.humanity')}
          </div>
        );
      }
      if (selectedListCode === LectureListCode.CART) {
        return (
          <div className={classNames('list-title')}>
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
                        isHighlighted={
                          isListClicked(l, lectureFocus) || isListFocused(l, lectureFocus)
                        }
                        inTimetable={inTimetable(l, selectedTimetable)}
                        isTimetableReadonly={
                          Boolean(!selectedTimetable || selectedTimetable.isReadOnly)
                        }
                        inCart={inCart(l, lists[LectureListCode.CART])}
                        fromCart={(selectedListCode === LectureListCode.CART)}
                        addToCart={this.addLectureToCart}
                        addToTable={this.addLectureToTable}
                        deleteFromCart={this.deleteLectureFromCart}
                        onMouseOver={this.focusLectureWithHover}
                        onMouseOut={this.unfocusLectureWithHover}
                        onClick={this.focusLectureWithClick}
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
      <div className={classNames('section', 'section--lecture-list')}>
        <div className={classNames('subsection', 'subsection--flex', 'subsection--lecture-list')}>
          { ((selectedListCode === LectureListCode.SEARCH)) ? <LectureSearchSubSection /> : null }
          <CloseButton onClick={this.mobileCloseLectureList} />
          { getListTitle() }
          <div
            className={classNames(
              'subsection--lecture-list__selector',
              (lectureFocus.clicked ? 'subsection--lecture-list__selector--dimmed' : null),
            )}
            ref={this.arrowRef}
          >
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
  selectedTimetable: PropTypes.oneOfType([timetableShape, myPseudoTimetableShape]),
  lectureFocus: lectureFocusShape.isRequired,
  year: PropTypes.number,
  semester: PropTypes.oneOf([1, 2, 3, 4]),
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
