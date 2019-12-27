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
      .catch((response) => {
      });
  }

  clickCircle = (filter_) => {
    const filterName = filter_.name;
    const { value, isChecked } = filter_;

    if (isChecked) {
      this.setState((prevState) => {
        const filter = prevState[filterName];
        if (value === 'ALL') {
          filter.clear();
        }
        filter.add(value);
        return prevState;
      });
    }
    else {
      this.setState((prevState) => {
        const filter = prevState[filterName];
        filter.delete(value);
        return prevState;
      });
    }
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
      .catch((response) => {
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
    else if (e.keyCode === 13) {
      this.searchStart();
    }
  }

  render() {
    const { t } = this.props;
    const { inputVal, autoComplete } = this.state;

    return (
      <div className={classNames('search-area')}>
        <form method="post">
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
              clickCircle={this.clickCircle}
              inputName="type"
              titleName={t('ui.search.type')}
              valueArr={['ALL', 'GR', 'MGC', 'BE', 'BR', 'EG', 'HSE', 'OE', 'ME', 'MR', 'ETC']}
              nameArr={[t('ui.type.allShort'), t('ui.type.generalRequiredShort'), t('ui.type.mandatoryGeneralCourseShort'), t('ui.type.basicElectiveShort'), t('ui.type.basicRequiredShort'), t('ui.type.electiveGraduateShort'), t('ui.type.humanitiesSocialElectiveShort'), t('ui.type.otherElectiveShort'), t('ui.type.majorElectiveShort'), t('ui.type.majorRequiredShort'), t('ui.type.etcShort')]}
            />
            <SearchFilter
              clickCircle={this.clickCircle}
              inputName="department"
              titleName={t('ui.search.department')}
              valueArr={['ALL', 'HSS', 'CE', 'MSB', 'ME', 'PH', 'BiS', 'IE', 'ID', 'BS', 'MAS', 'NQE', 'EE', 'CS', 'AE', 'CH', 'CBE', 'MS', 'ETC']}
              nameArr={[t('ui.department.allShort'), t('ui.department.hssShort'), t('ui.department.ceShort'), t('ui.department.msbShort'), t('ui.department.meShort'), t('ui.department.phShort'), t('ui.department.bisShort'), t('ui.department.ieShort'), t('ui.department.idShort'), t('ui.department.bsShort'), t('ui.department.masShort'), t('ui.department.nqeShort'), t('ui.department.eeShort'), t('ui.department.csShort'), t('ui.department.aeShort'), t('ui.department.chShort'), t('ui.department.cbeShort'), t('ui.department.msShort'), t('ui.department.etcShort')]}
            />
            <SearchFilter
              clickCircle={this.clickCircle}
              inputName="grade"
              titleName={t('ui.search.level')}
              valueArr={['ALL', '100', '200', '300', '400']}
              nameArr={[t('ui.level.allShort'), t('ui.level.100sShort'), t('ui.level.200sShort'), t('ui.level.300sShort'), t('ui.level.400sShort')]}
            />
          </div>
          <div className={classNames('buttons')}>
            <span type="button" className={classNames('text-button')} onClick={() => this.searchStart()}>{t('ui.button.search')}</span>
            <span type="button" className={classNames('text-button')} onClick={() => this.hideSearch()}>{t('ui.button.cancel')}</span>
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
