import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';
import { BASE_URL } from '../../../common/constants';
import { setLectures } from '../../../actions/dictionary/courseActive';
import CourseShape from '../../../shapes/CourseShape';
import lectureShape from '../../../shapes/LectureShape';
import HistoryLecturesBlock from '../../blocks/HistoryLecturesBlock';


class CourseHistorySubSection extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { course, setLecturesDispatch } = this.props;

    if (prevProps.clicked && (prevProps.course.id === course.id)) {
      return;
    }

    axios.get(`${BASE_URL}/api/courses/${course.id}/lectures`, {
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.course.id !== course.id) {
          return;
        }
        setLecturesDispatch(response.data);
      })
      .catch((response) => {
      });
  }


  render() {
    const { t } = this.props;
    const { lectures } = this.props;

    return (
      <>
        <div className={classNames('small-title')}>{t('ui.title.courseHistory')}</div>
        {
          (lectures == null)
            ? <div>{t('ui.placeholder.loading')}</div>
            : (
              <div className={classNames('history')}>
                <table>
                  <tbody>
                    <tr>
                      <th>{t('ui.semester.spring')}</th>
                      {[...Array(2019 - 2009 + 1).keys()].map((i) => {
                        const y = 2009 + i;
                        const filteredLectures = lectures.filter(l => ((l.year === y) && (l.semester === 1)));
                        if (filteredLectures.length === 0) {
                          return <td className={classNames('history__cell--unopen')} key={`${y}-1`}>{t('ui.others.notOffered')}</td>;
                        }
                        return <td key={`${y}-1`}><HistoryLecturesBlock lectures={filteredLectures} /></td>;
                      })}
                    </tr>
                    <tr>
                      <th />
                      {[...Array(2019 - 2009 + 1).keys()].map((i) => {
                        const y = 2009 + i;
                        return (
                          <td className={classNames('history__cell--year-label')} key={`${y}-l`}>{y}</td>
                        );
                      })}
                    </tr>
                    <tr>
                      <th>{t('ui.semester.fall')}</th>
                      {[...Array(2019 - 2009 + 1).keys()].map((i) => {
                        const y = 2009 + i;
                        const filteredLectures = lectures.filter(l => ((l.year === y) && (l.semester === 3)));
                        if (filteredLectures.length === 0) {
                          return <td className={classNames('history__cell--unopen')} key={`${y}-3`}>{t('ui.others.notOffered')}</td>;
                        }
                        return <td key={`${y}-3`}><HistoryLecturesBlock lectures={filteredLectures} /></td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )
        }
      </>
    );
  }
}

const mapStateToProps = state => ({
  clicked: state.dictionary.courseActive.clicked,
  course: state.dictionary.courseActive.course,
  lectures: state.dictionary.courseActive.lectures,
});

const mapDispatchToProps = dispatch => ({
  setLecturesDispatch: (lectures) => {
    dispatch(setLectures(lectures));
  },
});

CourseHistorySubSection.propTypes = {
  clicked: PropTypes.bool.isRequired,
  course: CourseShape,
  lectures: PropTypes.arrayOf(lectureShape),
  setLecturesDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseHistorySubSection));
