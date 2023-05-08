import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';
import { debounce } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import { LectureListCode } from '../../../../reducers/timetable/list';

import { getRangeStr } from '../../../../utils/timeUtils';

import Divider from '../../../Divider';
import SearchFilter from '../../../SearchFilter';
import Scroller from '../../../Scroller';

import { closeSearch, clearClasstimeOptions, setLastSearchOption } from '../../../../actions/timetable/search';
import { setListLectures, clearSearchListLectures } from '../../../../actions/timetable/list';
import { clearLectureFocus } from '../../../../actions/timetable/lectureFocus';

import { LectureFocusFrom } from '../../../../reducers/timetable/lectureFocus';

import lectureFocusShape from '../../../../shapes/state/timetable/LectureFocusShape';

import { getTypeOptions, getDepartmentOptions, getLevelOptions } from '../../../../common/searchOptions';


class LectureSearchSubSection extends Component {
  INITIAL_STATE = {
    keyword: '',
    autocompleteText: '',
    selectedTypes: new Set(['ALL']),
    selectedDepartments: new Set(['ALL']),
    selectedLevels: new Set(['ALL']),
  }

  constructor(props) {
    super(props);
    this.state = this.INITIAL_STATE;
  }

  hideSearch = () => {
    const { closeSearchDispatch } = this.props;

    this.setState(this.INITIAL_STATE);
    closeSearchDispatch();
  }

  searchStart = () => {
    const LIMIT = 300;

    const { t } = this.props;
    const {
      selectedTypes, selectedDepartments, selectedLevels,
      keyword,
    } = this.state;
    const {
      lectureFocus,
      year, semester,
      classtimeBegin, classtimeDay, classtimeEnd,
      closeSearchDispatch, clearSearchListLecturesDispatch,
      setListLecturesDispatch, clearLectureFocusDispatch,
      setLastSearchOptionDispatch,
    } = this.props;

    if (
      (selectedTypes.size === 1 && selectedTypes.has('ALL'))
      && (selectedDepartments.size === 1 && selectedDepartments.has('ALL'))
      && (selectedLevels.size === 1 && selectedLevels.has('ALL'))
      && keyword.trim().length === 0
      && !(classtimeBegin !== null && classtimeEnd !== null && classtimeDay !== null)
    ) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.blankSearch'));
      return;
    }

    const option = {
      keyword: keyword,
      type: Array.from(selectedTypes),
      department: Array.from(selectedDepartments),
      level: Array.from(selectedLevels),
      day: (classtimeDay !== null) ? classtimeDay : undefined,
      begin: (classtimeBegin !== null) ? (classtimeBegin / 30 - 8 * 2) : undefined,
      end: (classtimeEnd !== null) ? (classtimeEnd / 30 - 8 * 2) : undefined,
    };

    this.setState(this.INITIAL_STATE);
    closeSearchDispatch();
    clearSearchListLecturesDispatch();
    setLastSearchOptionDispatch(option);
    if (lectureFocus.from === LectureFocusFrom.LIST) {
      clearLectureFocusDispatch();
    }

    axios.get(
      '/api/lectures',
      {
        params: {
          year: year,
          semester: semester,
          ...option,
          order: ['old_code', 'class_no'],
          limit: LIMIT,
        },
        metadata: {
          gaCategory: 'Timetable',
          gaVariable: 'POST / List',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        if (response.data.length === LIMIT) {
          // eslint-disable-next-line no-alert
          alert(t('ui.message.tooManySearchResults', { count: LIMIT }));
        }
        setListLecturesDispatch(LectureListCode.SEARCH, response.data);
      })
      .catch((error) => {
      });

    ReactGA.event({
      category: 'Timetable - Search',
      action: 'Searched Lecture',
    });
  }

  updateCheckedValues = (filterName) => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.searchStart();
  }

  handleInput = (e) => {
    const { value } = e.target;

    this.setState({
      keyword: e.target.value,
      autocompleteText: '',
    });

    if (!value.trim()) {
      return;
    }

    this._fetchAutocomplete(value);
  }

  // eslint-disable-next-line react/sort-comp
  _fetchAutocomplete = debounce((value) => {
    const { year, semester } = this.props;

    axios.get(
      '/api/lectures/autocomplete',
      {
        params: {
          year: year,
          semester: semester,
          keyword: value,
        },
        metadata: {
          gaCategory: 'Lecture',
          gaVariable: 'GET Autocomplete / List',
        },
      },
    )
      .then((response) => {
        const { keyword } = this.state;
        const newProps = this.props;
        const complete = response.data;
        if (value !== keyword
          || (newProps.year !== year || newProps.semester !== semester)
        ) {
          return;
        }
        this.setState({
          autocompleteText: complete.substring(value.length, complete.length),
        });
      })
      .catch((error) => {
      });
  }, 500)

  applyAutocomplete = () => {
    this.setState((prevState) => ({
      keyword: prevState.keyword + prevState.autocompleteText,
      autocompleteText: '',
    }));
  }

  clearAutocomplete = () => {
    this.setState({
      keyword: '',
      autocompleteText: '',
    });
  }

  onKeyPress = (e) => {
    if (e.keyCode === 9) {
      this.applyAutocomplete();
      e.stopPropagation(); // Prevent move focus
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();
    }
  }

  clearSearchTime = () => {
    const { clearClasstimeOptionsDispatch } = this.props;

    clearClasstimeOptionsDispatch();
  }

  render() {
    const { t, searchOpen } = this.props;
    const {
      keyword,
      autocompleteText,
      selectedTypes, selectedDepartments, selectedLevels,
    } = this.state;
    const { classtimeBegin, classtimeEnd, classtimeDay } = this.props;

    return (
      <div className={classNames('search-area', (searchOpen ? null : 'search-area--hidden'))}>
        <form onSubmit={this.handleSubmit}>
          <div className={classNames('list-title', 'list-title--search-input')}>
            <i className={classNames('icon', 'icon--search')} />
            <div>
              <input
                type="text"
                name="keyword"
                autoComplete="off"
                placeholder={t('ui.tab.search')}
                value={keyword}
                onKeyDown={(e) => this.onKeyPress(e)}
                onChange={(e) => this.handleInput(e)}
              />
              <div className={classNames('search-keyword-autocomplete')}>
                <span className={classNames('search-keyword-autocomplete-space')}>{keyword}</span>
                <span className={classNames('search-keyword-autocomplete-body')}>{autocompleteText}</span>
              </div>
            </div>
          </div>
          <Scroller expandBottom={0}>
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('selectedTypes')}
              inputName="type"
              titleName={t('ui.search.type')}
              options={getTypeOptions()}
              checkedValues={selectedTypes}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('selectedDepartments')}
              inputName="department"
              titleName={t('ui.search.department')}
              options={getDepartmentOptions()}
              checkedValues={selectedDepartments}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('selectedLevels')}
              inputName="level"
              titleName={t('ui.search.level')}
              options={getLevelOptions()}
              checkedValues={selectedLevels}
            />
            <div className={classNames('attribute')}>
              <span>{t('ui.search.time')}</span>
              <div>

                { classtimeDay !== null
                  ? (
                    <span className={classNames('text-button')} onClick={this.clearSearchTime}>
                      {`${getRangeStr(classtimeDay, classtimeBegin, classtimeEnd)}`}
                    </span>
                  )
                  : (
                    <span>
                      {t('ui.others.dragTimetable')}
                    </span>
                  )
                }
              </div>
            </div>
          </Scroller>
          <div className={classNames('buttons')}>
            <button type="submit" className={classNames('text-button')}>{t('ui.button.search')}</button>
            <button type="button" className={classNames('text-button')} onClick={() => this.hideSearch()}>{t('ui.button.cancel')}</button>
          </div>
          <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  classtimeBegin: state.timetable.search.classtimeBegin,
  classtimeEnd: state.timetable.search.classtimeEnd,
  classtimeDay: state.timetable.search.classtimeDay,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
  lectureFocus: state.timetable.lectureFocus,
  searchOpen: state.timetable.search.open,
});

const mapDispatchToProps = (dispatch) => ({
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  clearClasstimeOptionsDispatch: () => {
    dispatch(clearClasstimeOptions());
  },
  setListLecturesDispatch: (code, lectures) => {
    dispatch(setListLectures(code, lectures));
  },
  clearSearchListLecturesDispatch: () => {
    dispatch(clearSearchListLectures());
  },
  clearLectureFocusDispatch: () => {
    dispatch(clearLectureFocus());
  },
  setLastSearchOptionDispatch: (lastSearchOption) => {
    dispatch(setLastSearchOption(lastSearchOption));
  },
});

LectureSearchSubSection.propTypes = {
  classtimeBegin: PropTypes.number,
  classtimeEnd: PropTypes.number,
  classtimeDay: PropTypes.number,
  year: PropTypes.number,
  semester: PropTypes.oneOf([1, 2, 3, 4]),
  lectureFocus: lectureFocusShape,
  searchOpen: PropTypes.bool.isRequired,

  closeSearchDispatch: PropTypes.func.isRequired,
  clearClasstimeOptionsDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  clearSearchListLecturesDispatch: PropTypes.func.isRequired,
  clearLectureFocusDispatch: PropTypes.func.isRequired,
  setLastSearchOptionDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    LectureSearchSubSection
  )
);
