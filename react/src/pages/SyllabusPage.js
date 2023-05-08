import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import userShape from '../shapes/model/session/UserShape';

import Scroller from '../components/Scroller';

import { getSyllabusUrl } from '../utils/lectureUtils';


class SyllabusPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lectures: undefined,
      selectedLecture: undefined,
    };
  }


  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._setTimetableLectures();
    }
  }


  componentDidUpdate(prevProps, prevState) {
    const { user } = this.props;

    if (!prevProps.user && user) {
      this._setTimetableLectures();
    }
  }


  _setTimetableLectures = () => {
    const { user } = this.props;
    // eslint-disable-next-line react/destructuring-assignment
    const { timetable, year, semester } = this.props.location.state;

    if (timetable === -1) {
      const lectures = user.my_timetable_lectures
        .filter((l) => (l.year === year && l.semester === semester));
      this.setState({
        lectures: lectures,
        selectedLecture: lectures[0],
      });
    }
    else {
      axios.get(
        `/api/users/${user.id}/timetables/${timetable}`,
        {
          params: {
          },
          metadata: {
            gaCategory: 'Timetable',
            gaVariable: 'GET / Instance',
          },
        },
      )
        .then((response) => {
          const lectures = response.data.lectures;
          this.setState({
            lectures: lectures,
            selectedLecture: lectures[0],
          });
        })
        .catch((error) => {
        });
    }
  }

  updateShowingLecture = (lecture) => {
    this.setState({ selectedLecture: lecture });
  }

  render() {
    const { t } = this.props;
    const { lectures, selectedLecture } = this.state;

    const tabs = (
      lectures
        ? (
          lectures.map((l) => (
            <div className={classNames('tabs__elem', (selectedLecture === l ? 'tabs__elem--selected' : null))} onClick={() => this.updateShowingLecture(l)}>
              { l[t('js.property.title')] }
            </div>
          ))
        )
        : (
          <div className={classNames(('tabs__elem'))} style={{ pointerEvents: 'none' }}>
            { t('ui.placeholder.loading') }
          </div>
        )
    );
    const contents = (
      lectures
        ? (
          lectures.map((l) => (
            <iframe src={getSyllabusUrl(l)} title={`syllabus-${l.title}`} key={l.id} style={l.id === selectedLecture.id ? {} : { display: 'none' }}>
              { l[t('js.property.title')] }
            </iframe>
          ))
        )
        : null
    );

    return (
      <section className={classNames('content', 'content--no-scroll')}>
        <div className={classNames('page-grid', 'page-grid--syllabus')}>
          <div className={classNames('tabs', 'tabs--syllabus')}>
            <Scroller noScrollX={false} noScrollY={true} expandBottom={2}>
              { tabs }
            </Scroller>
          </div>
          <div className={classNames('section', 'section--syllabus')}>
            <div className={classNames('subsection', 'subsection--syllabus')}>
              { contents }
            </div>
          </div>
        </div>
      </section>

    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
});

SyllabusPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      timetable: PropTypes.number.isRequired,
      year: PropTypes.number.isRequired,
      semester: PropTypes.oneOf([1, 2, 3, 4]).isRequired,
    }).isRequired,
  }).isRequired,

  user: userShape,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    SyllabusPage
  )
);
