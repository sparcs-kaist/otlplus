import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';

import SearchFilter from '../../SearchFilter';

import { closeSearch } from '../../../actions/dictionary/search';
import { setListCourses, clearSearchListCourses } from '../../../actions/dictionary/list';
import { clearCourseActive } from '../../../actions/dictionary/courseActive';


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
    const { type, department, grade, term, inputVal } = this.state;
    const { closeSearchDispatch, clearSearchListCoursesDispatch, setListCoursesDispatch, clearCourseActiveDispatch } = this.props;

    if (type.size === 1 && department.size === 1 && grade.size === 1 && inputVal.trim().length === 0) {
      if (type.has('ALL') && department.has('ALL') && grade.has('ALL')) {
        // eslint-disable-next-line no-alert
        alert(t('ui.message.blankSearch'));
        return;
      }
    }
    closeSearchDispatch();
    clearSearchListCoursesDispatch();
    clearCourseActiveDispatch();

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

  updateCheckedValues = filterName => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.searchStart();
  }

  handleInput(e) {
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

  autocompleteApply() {
    this.setState(prevState => ({
      inputVal: prevState.inputVal + prevState.autoComplete,
      autoComplete: '',
    }));
  }

  autocompleteCLear() {
    this.setState({
      inputVal: '',
      autoComplete: '',
    });
  }

  keyPress(e) {
    if (e.keyCode === 9) {
      this.autocompleteApply();
      e.stopPropagation(); // Prevent move focus
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();
    }
  }

  render() {
    const { t } = this.props;
    const { inputVal, autoComplete, type, department, grade, term } = this.state;

    const typeOptions = [
      ['ALL', t('ui.type.allShort')],
      ['BR', t('ui.type.basicRequiredShort')], ['BE', t('ui.type.basicElectiveShort')],
      ['MR', t('ui.type.majorRequiredShort')], ['ME', t('ui.type.majorElectiveShort')],
      ['MGC', t('ui.type.mandatoryGeneralCourseShort')], ['HSE', t('ui.type.humanitiesSocialElectiveShort')],
      ['GR', t('ui.type.generalRequiredShort')], ['EG', t('ui.type.electiveGraduateShort')],
      ['OE', t('ui.type.otherElectiveShort')],
      ['ETC', t('ui.type.etcShort')],
    ];
    // eslint-disable-next-line fp/no-mutating-methods
    const departmentOptions = [
      ['ALL', t('ui.department.allShort'), 100],
      ['HSS', t('ui.department.hssShort'), 200],
      ['CE', t('ui.department.ceShort'), 500], ['MSB', t('ui.department.msbShort'), 500],
      ['ME', t('ui.department.meShort'), 500], ['PH', t('ui.department.phShort'), 500],
      ['BiS', t('ui.department.bisShort'), 500], ['IE', t('ui.department.ieShort'), 500],
      ['ID', t('ui.department.idShort'), 500], ['BS', t('ui.department.bsShort'), 500],
      ['MAS', t('ui.department.masShort'), 500], ['NQE', t('ui.department.nqeShort'), 500],
      ['EE', t('ui.department.eeShort'), 500], ['CS', t('ui.department.csShort'), 500],
      ['AE', t('ui.department.aeShort'), 500], ['CH', t('ui.department.chShort'), 500],
      ['CBE', t('ui.department.cbeShort'), 500], ['MS', t('ui.department.msShort'), 500],
      ['ETC', t('ui.department.etcShort'), 900],
    ].sort((a, b) => {
      if (a[2] !== b[2]) {
        return a[2] - b[2];
      }
      return (a[1] < b[1]) ? -1 : 1;
    })
      .map(o => o.slice(0, 2));
    const levelOptions = [
      ['ALL', t('ui.level.allShort')],
      ['100', t('ui.level.100sShort')], ['200', t('ui.level.200sShort')],
      ['300', t('ui.level.300sShort')], ['400', t('ui.level.400sShort')],
    ];
    const termOptions = [
      ['ALL', t('ui.term.allShort')],
      ['3', t('ui.term.3yearsShort')],
    ];

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
                onKeyDown={e => this.keyPress(e)}
                onChange={e => this.handleInput(e)}
              />
              <div className={classNames('search-keyword-autocomplete')}>
                <span className={classNames('search-keyword-autocomplete-space')}>{inputVal}</span>
                <span className={classNames('search-keyword-autocomplete-body')}>{autoComplete}</span>
              </div>
            </div>
          </div>
          <div>
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
          </div>
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

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  setListCoursesDispatch: (code, courses) => {
    dispatch(setListCourses(code, courses));
  },
  clearSearchListCoursesDispatch: () => {
    dispatch(clearSearchListCourses());
  },
  clearCourseActiveDispatch: () => {
    dispatch(clearCourseActive());
  },
});

CourseSearchSubSection.propTypes = {
  closeSearchDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
  clearSearchListCoursesDispatch: PropTypes.func.isRequired,
  clearCourseActiveDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseSearchSubSection));
