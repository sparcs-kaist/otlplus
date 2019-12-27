import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';

import { BASE_URL } from '../../../common/constants';
import { closeSearch, clearDrag } from '../../../actions/timetable/search';
import { setListLectures, clearSearchListLectures } from '../../../actions/timetable/list';
import SearchFilter from '../../SearchFilter';


class LectureSearchSubSection extends Component {
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
    const { year, semester, start, day, end, closeSearchDispatch, clearSearchListLecturesDispatch, setListLecturesDispatch } = this.props;

    if (type.size === 1 && department.size === 1 && grade.size === 1 && inputVal.length === 0
      && !(start !== null && end !== null && day !== null)) {
      if (type.has('ALL') && department.has('ALL') && grade.has('ALL')) {
        // eslint-disable-next-line no-alert
        alert(t('ui.message.blankSearch'));
        return;
      }
    }
    closeSearchDispatch();
    clearSearchListLecturesDispatch();

    axios.get(`${BASE_URL}/api/lectures`, { params: {
      year: year,
      semester: semester,
      department: Array.from(department),
      type: Array.from(type),
      grade: Array.from(grade),
      keyword: inputVal,
      begin: (start !== null) ? start.toString() : '',
      end: (end !== null) ? end.toString() : '',
      day: (day !== null) ? day.toString() : '',
    } })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        const lectures = response.data;
        setListLecturesDispatch('search', lectures);
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

  handleInput = (e) => {
    const { value } = e.target;
    const { year, semester } = this.props;

    this.setState({
      inputVal: e.target.value,
      autoComplete: '',
    });

    if (!value) {
      return;
    }

    axios.get(`${BASE_URL}/api/lectures/autocomplete`, { params: {
      year: year,
      semester: semester,
      keyword: value,
    } })
      .then((response) => {
        const { inputVal } = this.state;
        const newProps = this.props;
        const complete = response.data;
        if (value !== inputVal
          || (newProps.year !== year || newProps.semester !== semester)
        ) {
          return;
        }
        this.setState({
          autoComplete: complete.substring(value.length, complete.length),
        });
      })
      .catch((response) => {
      });
  }

  autocompleteApply = () => {
    this.setState(prevState => ({
      inputVal: prevState.inputVal + prevState.autoComplete,
      autoComplete: '',
    }));
  }

  autocompleteCLear = () => {
    this.setState({
      inputVal: '',
      autoComplete: '',
    });
  }

  keyPress = (e) => {
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

  clearSearchTime = () => {
    const { clearDragDispatch } = this.props;

    clearDragDispatch();
  }

  render() {
    const { t } = this.props;
    const { inputVal, autoComplete } = this.state;
    const { start, end, day } = this.props;

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
            <div className={classNames('attribute')}>
              <label>{t('ui.search.time')}</label>
              { day !== null
                ? (
                  <label className={classNames('text-button')} onClick={this.clearSearchTime}>
                    {`${[t('ui.day.monday'), t('ui.day.tuesday'), t('ui.day.wednesday'), t('ui.day.thursday'), t('ui.day.friday')][day]} \
                      ${8 + Math.floor(start / 2)}:${['00', '30'][start % 2]} ~ \
                      ${8 + Math.floor(end / 2)}:${['00', '30'][end % 2]}`}
                  </label>
                )
                : (
                  <label>
                    {t('ui.others.dragTimetable')}
                  </label>
                )
              }
            </div>
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
  start: state.timetable.search.start,
  end: state.timetable.search.end,
  day: state.timetable.search.day,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = dispatch => ({
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  clearDragDispatch: () => {
    dispatch(clearDrag());
  },
  setListLecturesDispatch: (code, lectures) => {
    dispatch(setListLectures(code, lectures));
  },
  clearSearchListLecturesDispatch: () => {
    dispatch(clearSearchListLectures());
  },
});

LectureSearchSubSection.propTypes = {
  start: PropTypes.number,
  end: PropTypes.number,
  day: PropTypes.number,
  year: PropTypes.number,
  semester: PropTypes.number,
  closeSearchDispatch: PropTypes.func.isRequired,
  clearDragDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  clearSearchListLecturesDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureSearchSubSection));
