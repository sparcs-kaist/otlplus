import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { SEARCH } from '../../../reducers/dictionary/list';

import SearchFilter from '../../SearchFilter';
import Scroller from '../../Scroller';

import { closeSearch } from '../../../actions/dictionary/search';
import { setListCourses, clearSearchListCourses } from '../../../actions/dictionary/list';
import { clearCourseFocus } from '../../../actions/dictionary/courseFocus';

import {
  typeOptions, departmentOptions, levelOptions, termOptions,
} from '../../../common/seachOptions';


class CourseSearchSubSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      autocompleteText: '',
      selectedTypes: new Set(['ALL']),
      selectedDepartments: new Set(['ALL']),
      selectedLevels: new Set(['ALL']),
      selectedTerms: new Set(['ALL']),
    };
  }

  hideSearch = () => {
    const { closeSearchDispatch } = this.props;

    closeSearchDispatch();
  }

  searchStart = () => {
    const { t } = this.props;
    const {
      selectedTypes, selectedDepartments, selectedLevels, selectedTerms,
      keyword,
    } = this.state;
    const {
      closeSearchDispatch, clearSearchListCoursesDispatch,
      setListCoursesDispatch, clearCourseFocusDispatch,
    } = this.props;

    if (
      (selectedTypes.size === 1 && selectedTypes.has('ALL'))
      && (selectedDepartments.size === 1 && selectedDepartments.has('ALL'))
      && (selectedLevels.size === 1 && selectedLevels.has('ALL'))
      && keyword.trim().length === 0
    ) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.blankSearch'));
      return;
    }
    closeSearchDispatch();
    clearSearchListCoursesDispatch();
    clearCourseFocusDispatch();

    axios.get(
      '/api/courses',
      {
        params: {
          department: Array.from(selectedDepartments),
          type: Array.from(selectedTypes),
          grade: Array.from(selectedLevels),
          term: Array.from(selectedTerms),
          keyword: keyword,
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        setListCoursesDispatch(SEARCH, response.data);
      })
      .catch((error) => {
      });

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
  }

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
    const { t } = this.props;
    const {
      keyword,
      autocompleteText,
      selectedTypes, selectedDepartments, selectedLevels, selectedTerms,
    } = this.state;

    return (
      <div className={classNames('search-area')}>
        <form onSubmit={this.handleSubmit}>
          <div className={classNames('title', 'title--search')}>
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
              options={typeOptions}
              checkedValues={selectedTypes}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('selectedDepartments')}
              inputName="department"
              titleName={t('ui.search.department')}
              options={departmentOptions}
              checkedValues={selectedDepartments}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('selectedLevels')}
              inputName="grade"
              titleName={t('ui.search.level')}
              options={levelOptions}
              checkedValues={selectedLevels}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('selectedTerms')}
              inputName="term"
              titleName={t('ui.search.term')}
              options={termOptions}
              checkedValues={selectedTerms}
            />
          </Scroller>
          <div className={classNames('buttons')}>
            <button type="submit" className={classNames('text-button')}>{t('ui.button.search')}</button>
            <button type="button" className={classNames('text-button')} onClick={() => this.hideSearch()}>{t('ui.button.cancel')}</button>
          </div>
          <div className={classNames('divider')} />
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
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
});

CourseSearchSubSection.propTypes = {
  closeSearchDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
  clearSearchListCoursesDispatch: PropTypes.func.isRequired,
  clearCourseFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseSearchSubSection));
