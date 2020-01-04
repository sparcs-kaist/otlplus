import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';

import { BASE_URL } from '../../../common/constants';
import { closeSearch } from '../../../actions/dictionary/search';
import { setListCourses, clearSearchListCourses } from '../../../actions/dictionary/list';
import SearchFilter from '../../SearchFilter';


class CourseSearchSubSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputVal: '',
      autoComplete: '',
      type: new Set(['ALL']),
      department: new Set(['ALL']),
      grade: new Set(['ALL']),
    };
  }

  hideSearch = () => {
    const { closeSearchDispatch } = this.props;

    closeSearchDispatch();
  }

  searchStart = () => {
    const { t } = this.props;
    const { type, department, grade, inputVal } = this.state;
    const { closeSearchDispatch, clearSearchListCoursesDispatch, setListCoursesDispatch } = this.props;

    if (type.size === 1 && department.size === 1 && grade.size === 1 && inputVal.length === 0) {
      if (type.has('ALL') && department.has('ALL') && grade.has('ALL')) {
        // eslint-disable-next-line no-alert
        alert(t('ui.message.blankSearch'));
        return;
      }
    }
    closeSearchDispatch();
    clearSearchListCoursesDispatch();

    axios.get(`${BASE_URL}/api/courses`, { params: {
      department: Array.from(department),
      type: Array.from(type),
      grade: Array.from(grade),
      keyword: inputVal,
    } })
      .then((response) => {
        setListCoursesDispatch('search', response.data);
      })
      .catch((error) => {
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

    if (!value) {
      return;
    }

    axios.get(`${BASE_URL}/api/courses/autocomplete`, { params: {
      keyword: value,
    } })
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
    const { inputVal, autoComplete } = this.state;

    const typeOptions = [
      ['ALL', t('ui.type.allShort')],
      ['GR', t('ui.type.generalRequiredShort')], ['MGC', t('ui.type.mandatoryGeneralCourseShort')],
      ['BE', t('ui.type.basicElectiveShort')], ['BR', t('ui.type.basicRequiredShort')],
      ['EG', t('ui.type.electiveGraduateShort')], ['HSE', t('ui.type.humanitiesSocialElectiveShort')],
      ['OE', t('ui.type.otherElectiveShort')], ['ME', t('ui.type.majorElectiveShort')],
      ['MR', t('ui.type.majorRequiredShort')],
      ['ETC', t('ui.type.etcShort')],
    ];
    const departmentOptions = [
      ['ALL', t('ui.department.allShort')],
      ['HSS', t('ui.department.hssShort')],
      ['CE', t('ui.department.ceShort')], ['MSB', t('ui.department.msbShort')],
      ['ME', t('ui.department.meShort')], ['PH', t('ui.department.phShort')],
      ['BiS', t('ui.department.bisShort')], ['IE', t('ui.department.ieShort')],
      ['ID', t('ui.department.idShort')], ['BS', t('ui.department.bsShort')],
      ['MAS', t('ui.department.masShort')], ['NQE', t('ui.department.nqeShort')],
      ['EE', t('ui.department.eeShort')], ['CS', t('ui.department.csShort')],
      ['AE', t('ui.department.aeShort')], ['CH', t('ui.department.chShort')],
      ['CBE', t('ui.department.cbeShort')], ['MS', t('ui.department.msShort')],
      ['ETC', t('ui.department.etcShort')],
    ];
    const levelOptions = [
      ['ALL', t('ui.level.allShort')],
      ['100', t('ui.level.100sShort')], ['200', t('ui.level.200sShort')],
      ['300', t('ui.level.300sShort')], ['400', t('ui.level.400sShort')],
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
              checkedValues={this.state.type}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('department')}
              inputName="department"
              titleName={t('ui.search.department')}
              options={departmentOptions}
              checkedValues={this.state.department}
            />
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('grade')}
              inputName="grade"
              titleName={t('ui.search.level')}
              options={levelOptions}
              checkedValues={this.state.grade}
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
});

CourseSearchSubSection.propTypes = {
  closeSearchDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
  clearSearchListCoursesDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseSearchSubSection));
