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
      keyword: '',
      autocompleteText: '',
      selectedTypes: new Set(['ALL']),
      selectedDepartments: new Set(['ALL']),
      selectedLevels: new Set(['ALL']),
    };
  }

  hideSearch = () => {
    const { closeSearchDispatch } = this.props;

    closeSearchDispatch();
  }

  searchStart = () => {
    const { t } = this.props;
    const {
      selectedTypes, selectedDepartments, selectedLevels,
      keyword,
    } = this.state;
    const {
      lectureFocus,
      year, semester,
      start, day, end,
      closeSearchDispatch, clearSearchListLecturesDispatch,
      setListLecturesDispatch, clearLectureFocusDispatch,
    } = this.props;

    if (
      (selectedTypes.size === 1 && selectedTypes.has('ALL'))
      && (selectedDepartments.size === 1 && selectedDepartments.has('ALL'))
      && (selectedLevels.size === 1 && selectedLevels.has('ALL'))
      && keyword.trim().length === 0
      && !(start !== null && end !== null && day !== null)
    ) {
        // eslint-disable-next-line no-alert
        alert(t('ui.message.blankSearch'));
        return;
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
          department: Array.from(selectedDepartments),
          type: Array.from(selectedTypes),
          grade: Array.from(selectedLevels),
          keyword: keyword,
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
      keyword: e.target.value,
      autocompleteText: '',
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

  clearSearchTime = () => {
    const { clearDragDispatch } = this.props;

    clearDragDispatch();
  }

  render() {
    const { t } = this.props;
    const {
      keyword,
      autocompleteText,
      selectedTypes, selectedDepartments, selectedLevels,
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
