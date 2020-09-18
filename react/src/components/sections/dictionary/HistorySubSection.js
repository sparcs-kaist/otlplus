import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import LectureGroupSimpleBlock from '../../blocks/LectureGroupSimpleBlock';

import { setLectures } from '../../../actions/dictionary/courseFocus';

import semesterShape from '../../../shapes/SemesterShape';
import courseShape from '../../../shapes/CourseShape';
import lectureShape from '../../../shapes/LectureShape';


class HistorySubSection extends Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line fp/no-mutation
    this.scrollRef = React.createRef();
  }


  componentDidMount() {
    this._fetchLectures();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    const { course, clicked, lectures, setLecturesDispatch } = this.props;

    if (
      clicked
      && course
      && (!prevProps.clicked || !prevProps.course || (prevProps.course.id !== course.id))) {
      setLecturesDispatch(null);
      this._fetchLectures();
    }

    if ((prevProps.lectures === null) && (lectures !== null)) {
      const scrollTarget = this.scrollRef.current.querySelector('.ScrollbarsCustom-Scroller');
      scrollTarget.scrollLeft = scrollTarget.scrollWidth;
    }
  }


  _fetchLectures = () => {
    const { course, setLecturesDispatch } = this.props;

    axios.get(
      `/api/courses/${course.id}/lectures`,
      {
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET Lectures / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.course.id !== course.id) {
          return;
        }
        setLecturesDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  render() {
    const { t } = this.props;
    const { course, semesters, lectures } = this.props;

    if (!course) {
      return null;
    }

    if (lectures === null) {
      return (
        <>
          <div className={classNames('small-title')}>{t('ui.title.courseHistory')}</div>
          <div ref={this.scrollRef}>
            <div className={classNames('list-placeholder', 'list-placeholder--history')}><div>{t('ui.placeholder.loading')}</div></div>
          </div>
        </>
      );
    }

    const semesterYears = (semesters != null)
      ? semesters.map(s => s.year)
      : [];
    const lectureYears = (lectures != null)
      ? lectures.map(l => l.year)
      : [];

    const getBlockOrPlaceholder = (year, semester) => {
      const filteredLectures = lectures
        .filter(l => ((l.year === year) && (l.semester === semester)));
      if (filteredLectures.length === 0) {
        return <td className={classNames('history__cell--unopen')} key={`${year}-1`}><div>{t('ui.others.notOffered')}</div></td>;
      }
      return <td key={`${year}-1`}><LectureGroupSimpleBlock lectures={filteredLectures} /></td>;
    };

    const startYear = Math.min(...semesterYears, ...lectureYears);
    const endYear = Math.max(...semesterYears, ...lectureYears);
    const targetYears = [...Array(endYear - startYear + 1).keys()].map(i => (startYear + i));

    const specialLectures = lectures.filter(l => (l[t('js.property.class_title')].length > 3));
    const isSpecialLectureCourse = (specialLectures.length / lectures.length) > 0.3;

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.courseHistory')}</div>

        <div ref={this.scrollRef}>

          <Scroller noScrollX={false} noScrollY={true}>
            <table className={classNames('history', (isSpecialLectureCourse ? 'history--special-lecture' : ''))}>
              <tbody>
                <tr>
                  <th>{t('ui.semester.spring')}</th>
                  {targetYears.map(y => getBlockOrPlaceholder(y, 1))}
                </tr>
                <tr>
                  <th />
                  {targetYears.map(y => (
                    <td className={classNames('history__cell--year-label')} key={`${y}-l`}>{y}</td>
                  ))}
                </tr>
                <tr>
                  <th>{t('ui.semester.fall')}</th>
                  {targetYears.map(y => getBlockOrPlaceholder(y, 3))}
                </tr>
              </tbody>
            </table>
          </Scroller>
        </div>
      </>
    );
  }
}

const mapStateToProps = state => ({
  semesters: state.common.semester.semesters,
  clicked: state.dictionary.courseFocus.clicked,
  course: state.dictionary.courseFocus.course,
  lectures: state.dictionary.courseFocus.lectures,
});

const mapDispatchToProps = dispatch => ({
  setLecturesDispatch: (lectures) => {
    dispatch(setLectures(lectures));
  },
});

HistorySubSection.propTypes = {
  semesters: PropTypes.arrayOf(semesterShape),
  clicked: PropTypes.bool.isRequired,
  course: courseShape,
  lectures: PropTypes.arrayOf(lectureShape),

  setLecturesDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(HistorySubSection));
