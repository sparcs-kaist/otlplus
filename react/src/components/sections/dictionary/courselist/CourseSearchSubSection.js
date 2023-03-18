import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';
import { debounce } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import { CourseListCode } from '../../../../reducers/dictionary/list';

import Divider from '../../../Divider';
import SearchFilter from '../../../SearchFilter';
import Scroller from '../../../Scroller';

import { closeSearch, setLastSearchOption } from '../../../../actions/dictionary/search';
import { setListCourses, clearSearchListCourses } from '../../../../actions/dictionary/list';
import { clearCourseFocus } from '../../../../actions/dictionary/courseFocus';

import {
  getTypeOptions, getDepartmentOptions, getLevelOptions, getTermOptions,
} from '../../../../common/searchOptions';
import { performSearchCourses } from '../../../../common/commonOperations';


class CourseSearchSubSection extends Component {
  INITIAL_STATE = {
    keyword: '',
    autocompleteText: '',
    selectedTypes: new Set(['ALL']),
    selectedDepartments: new Set(['ALL']),
    selectedLevels: new Set(['ALL']),
    selectedTerms: new Set(['ALL']),
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
    const LIMIT = 150;

    const { t } = this.props;
    const {
      selectedTypes, selectedDepartments, selectedLevels, selectedTerms,
      keyword,
    } = this.state;
    const {
      closeSearchDispatch, clearSearchListCoursesDispatch,
      setListCoursesDispatch, clearCourseFocusDispatch,
      setLastSearchOptionDispatch,
    } = this.props;

    const option = {
      keyword: keyword.trim(),
      type: Array.from(selectedTypes),
      department: Array.from(selectedDepartments),
      level: Array.from(selectedLevels),
      term: Array.from(selectedTerms),
    };

    const beforeRequest = () => {
      this.setState(this.INITIAL_STATE);
      closeSearchDispatch();
      clearSearchListCoursesDispatch();
      setLastSearchOptionDispatch(option);
      clearCourseFocusDispatch();
    };
    const afterResponse = (courses) => {
      if (courses.length === LIMIT) {
        // eslint-disable-next-line no-alert
        alert(t('ui.message.tooManySearchResults', { count: LIMIT }));
      }
      setListCoursesDispatch(CourseListCode.SEARCH, courses);
    };
    performSearchCourses(
      option, LIMIT,
      beforeRequest, afterResponse,
    );

    ReactGA.event({
      category: 'Dictionary - Search',
      action: 'Searched Course',
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
    axios.get(
      '/api/courses/autocomplete',
      {
        params: {
          keyword: value,
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET Autocomplete / List',
        },
      },
    )
      .then((response) => {
        const { keyword } = this.state;
        const complete = response.data;
        if (value !== keyword) {
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

  render() {
    const { t, searchOpen } = this.props;
    const {
      keyword,
      autocompleteText,
      selectedTypes, selectedDepartments, selectedLevels, selectedTerms,
    } = this.state;

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
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('selectedTerms')}
              inputName="term"
              titleName={t('ui.search.term')}
              options={getTermOptions()}
              checkedValues={selectedTerms}
            />
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
  searchOpen: state.dictionary.search.open,
});

const mapDispatchToProps = (dispatch) => ({
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  setListCoursesDispatch: (code, courses) => {
    dispatch(setListCourses(code, courses));
  },
  clearSearchListCoursesDispatch: () => {
    dispatch(clearSearchListCourses());
  },
  clearCourseFocusDispatch: () => {
    dispatch(clearCourseFocus());
  },
  setLastSearchOptionDispatch: (lastSearchOption) => {
    dispatch(setLastSearchOption(lastSearchOption));
  },
});

CourseSearchSubSection.propTypes = {
  searchOpen: PropTypes.bool.isRequired,

  closeSearchDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
  clearSearchListCoursesDispatch: PropTypes.func.isRequired,
  clearCourseFocusDispatch: PropTypes.func.isRequired,
  setLastSearchOptionDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseSearchSubSection
  )
);
