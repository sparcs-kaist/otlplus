import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
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
      inputVal: '',
      autoComplete: '',
      type: new Set(['ALL']),
      department: new Set(['ALL']),
      grade: new Set(['ALL']),
      term: new Set(['ALL']),
    };
  }

  hideSearch = () => {
    const { closeSearchDispatch } = this.props;

    closeSearchDispatch();
  }

  searchStart = () => {
    const { t } = this.props;
    const {
      type, department, grade, term,
      inputVal,
    } = this.state;
    const {
      closeSearchDispatch, clearSearchListCoursesDispatch,
      setListCoursesDispatch, clearCourseFocusDispatch,
    } = this.props;

    if (
      (type.size === 1 && type.has('ALL'))
      && (department.size === 1 && department.has('ALL'))
      && (grade.size === 1 && grade.has('ALL'))
      && inputVal.trim().length === 0
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
          department: Array.from(department),
          type: Array.from(type),
          grade: Array.from(grade),
          term: Array.from(term),
          keyword: inputVal,
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        setListCoursesDispatch('search', response.data);
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
      inputVal: e.target.value,
      autoComplete: '',
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
        const { inputVal } = this.state;
        const complete = response.data;
        if (value !== inputVal) {
          return;
        }
        this.setState({
          autoComplete: complete.substring(value.length, complete.length),
        });
      })
      .catch((error) => {
      });
  }

  applyAutocomplete = () => {
    this.setState((prevState) => ({
      inputVal: prevState.inputVal + prevState.autoComplete,
      autoComplete: '',
    }));
  }

  clearAutocomplete = () => {
    this.setState({
      inputVal: '',
      autoComplete: '',
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
      inputVal,
      autoComplete,
      type, department, grade, term,
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
                value={inputVal}
                onKeyDown={(e) => this.onKeyPress(e)}
                onChange={(e) => this.handleInput(e)}
              />
              <div className={classNames('search-keyword-autocomplete')}>
                <span className={classNames('search-keyword-autocomplete-space')}>{inputVal}</span>
                <span className={classNames('search-keyword-autocomplete-body')}>{autoComplete}</span>
              </div>
            </div>
          </div>
          <Scroller expandBottom={0}>
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('type')}
              inputName="type"
              titleName={t('ui.search.type')}
              options={typeOptions}
              checkedValues={type}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('department')}
              inputName="department"
              titleName={t('ui.search.department')}
              options={departmentOptions}
              checkedValues={department}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('grade')}
              inputName="grade"
              titleName={t('ui.search.level')}
              options={levelOptions}
              checkedValues={grade}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('term')}
              inputName="term"
              titleName={t('ui.search.term')}
              options={termOptions}
              checkedValues={term}
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
