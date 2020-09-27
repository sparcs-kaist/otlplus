import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import SearchFilter from '../../SearchFilter';

import Scroller from '../../Scroller';

import { closeSearch, clearDrag } from '../../../actions/timetable/search';
import { setListLectures, clearSearchListLectures } from '../../../actions/timetable/list';
import { clearLectureFocus } from '../../../actions/timetable/lectureFocus';

import lectureFocusShape from '../../../shapes/LectureFocusShape';

import { typeOptions, departmentOptions, levelOptions } from '../../../common/seachOptions';


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
    const {
      type, department, grade,
      inputVal,
    } = this.state;
    const {
      lectureFocus,
      year, semester,
      start, day, end,
      closeSearchDispatch, clearSearchListLecturesDispatch,
      setListLecturesDispatch, clearLectureFocusDispatch,
    } = this.props;

    if (type.size === 1 && department.size === 1 && grade.size === 1 && inputVal.trim().length === 0
      && !(start !== null && end !== null && day !== null)) {
      if (type.has('ALL') && department.has('ALL') && grade.has('ALL')) {
        // eslint-disable-next-line no-alert
        alert(t('ui.message.blankSearch'));
        return;
      }
    }
    closeSearchDispatch();
    clearSearchListLecturesDispatch();
    if (lectureFocus.from === 'LIST') {
      clearLectureFocusDispatch();
    }

    axios.get(
      '/api/lectures',
      {
        params: {
          year: year,
          semester: semester,
          department: Array.from(department),
          type: Array.from(type),
          grade: Array.from(grade),
          keyword: inputVal,
          begin: (start !== null) ? start.toString() : '',
          end: (end !== null) ? end.toString() : '',
          day: (day !== null) ? day.toString() : '',
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
        const lectures = response.data;
        setListLecturesDispatch('search', lectures);
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
    const { year, semester } = this.props;

    this.setState({
      inputVal: e.target.value,
      autoComplete: '',
    });

    if (!value.trim()) {
      return;
    }

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

  clearSearchTime = () => {
    const { clearDragDispatch } = this.props;

    clearDragDispatch();
  }

  render() {
    const { t } = this.props;
    const {
      inputVal,
      autoComplete,
      type, department, grade,
    } = this.state;
    const { start, end, day } = this.props;

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
            <div className={classNames('attribute')}>
              <span>{t('ui.search.time')}</span>
              <div>

                { day !== null
                  ? (
                    <span className={classNames('text-button')} onClick={this.clearSearchTime}>
                      {`${[t('ui.day.monday'), t('ui.day.tuesday'), t('ui.day.wednesday'), t('ui.day.thursday'), t('ui.day.friday')][day]} \
                        ${8 + Math.floor(start / 2)}:${['00', '30'][start % 2]} ~ \
                        ${8 + Math.floor(end / 2)}:${['00', '30'][end % 2]}`}
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
          <div className={classNames('divider')} />
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  start: state.timetable.search.start,
  end: state.timetable.search.end,
  day: state.timetable.search.day,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
  lectureFocus: state.timetable.lectureFocus,
});

const mapDispatchToProps = (dispatch) => ({
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
  clearLectureFocusDispatch: () => {
    dispatch(clearLectureFocus());
  },
});

LectureSearchSubSection.propTypes = {
  start: PropTypes.number,
  end: PropTypes.number,
  day: PropTypes.number,
  year: PropTypes.number,
  semester: PropTypes.number,
  lectureFocus: lectureFocusShape,

  closeSearchDispatch: PropTypes.func.isRequired,
  clearDragDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  clearSearchListLecturesDispatch: PropTypes.func.isRequired,
  clearLectureFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureSearchSubSection));
