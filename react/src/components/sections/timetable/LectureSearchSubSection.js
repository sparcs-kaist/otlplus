import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';

import { BASE_URL } from '../../../common/constants';
import { closeSearch, clearDrag } from '../../../actions/timetable/search';
import { setListLectures, clearSearchListLectures } from '../../../actions/timetable/list';
import { clearLectureActive } from '../../../actions/timetable/lectureActive';
import SearchFilter from '../../SearchFilter';
import lectureActiveShape from '../../../shapes/LectureActiveShape';


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
    const { year, semester, start, day, end, lectureActive, closeSearchDispatch, clearSearchListLecturesDispatch, setListLecturesDispatch, clearLectureActiveDispatch } = this.props;

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
    if (lectureActive.from === 'LIST') {
      clearLectureActiveDispatch();
    }

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
      .catch((error) => {
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
  }

  clearSearchTime = () => {
    const { clearDragDispatch } = this.props;

    clearDragDispatch();
  }

  render() {
    const { t } = this.props;
    const { inputVal, autoComplete } = this.state;
    const { start, end, day } = this.props;

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
            <div className={classNames('attribute')}>
              <span>{t('ui.search.time')}</span>
              <div>

                { day !== null
                  ? (
                    <label className={classNames('text-button')} onClick={this.clearSearchTime}>
                      {`${[t('ui.day.monday'), t('ui.day.tuesday'), t('ui.day.wednesday'), t('ui.day.thursday'), t('ui.day.friday')][day]} \
                        ${8 + Math.floor(start / 2)}:${['00', '30'][start % 2]} ~ \
                        ${8 + Math.floor(end / 2)}:${['00', '30'][end % 2]}`}
                    </label>
                  )
                  : (
                    <span>
                      {t('ui.others.dragTimetable')}
                    </span>
                  )
                }
              </div>
            </div>
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
  start: state.timetable.search.start,
  end: state.timetable.search.end,
  day: state.timetable.search.day,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
  lectureActive: state.timetable.lectureActive,
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
  clearLectureActiveDispatch: () => {
    dispatch(clearLectureActive());
  },
});

LectureSearchSubSection.propTypes = {
  start: PropTypes.number,
  end: PropTypes.number,
  day: PropTypes.number,
  year: PropTypes.number,
  semester: PropTypes.number,
  lectureActive: lectureActiveShape,
  closeSearchDispatch: PropTypes.func.isRequired,
  clearDragDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  clearSearchListLecturesDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureSearchSubSection));
