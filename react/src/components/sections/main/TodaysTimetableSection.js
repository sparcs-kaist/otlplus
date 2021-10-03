import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import queryString from 'qs';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import HorizontalTimetableTile from '../../tiles/HorizontalTimetableTile';

import userShape from '../../../shapes/UserShape';
import semesterShape from '../../../shapes/SemesterShape';

import { get_ongoing_semester } from '../../../utils/semesterUtils';


class TodaysTimetableSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cellWidth: 0,
      today: new Date(),
    };

    // eslint-disable-next-line fp/no-mutation
    this.scrollRef = React.createRef();
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
    this.interval = setInterval(() => this.setState({ today: new Date() }), 100);
  }

  componentDidUpdate(prevProps, prevState) {
    const { cellWidth } = this.state;
    if (prevState.cellWidth === 0 && cellWidth > 0) {
      this.setInitialScrollPosition();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    clearInterval(this.interval);
  }

  setInitialScrollPosition = () => {
    const INITIAL_BAR_POSITION = 58;

    const scrollTarget = this.scrollRef.current.querySelector('.ScrollbarsCustom-Scroller');
    scrollTarget.scrollLeft = this._getBarLeftPosition() - INITIAL_BAR_POSITION;
  }

  resize = () => {
    const cell = document
      .getElementsByClassName(classNames('hcell-left'))[0]
      .getBoundingClientRect();
    this.setState({
      cellWidth: cell.width,
    });
  }

  _getBarLeftPosition = () => {
    const BAR_CIRCLE_WIDTH = 5;
    const BAR_LINE_WIDTH = 1;
    const TABLE_LEFT_MARGIN = 2;

    const { cellWidth, today } = this.state;

    const hours = today.getHours();
    const minutes = today.getMinutes();

    const floatHours = hours + (minutes / 60);

    return (floatHours - 8) * cellWidth * 2
      + TABLE_LEFT_MARGIN
      - (BAR_CIRCLE_WIDTH - BAR_LINE_WIDTH) / 2;
  }

  render() {
    const { t } = this.props;
    const { cellWidth, today } = this.state;
    const { user, semesters } = this.props;

    const ongoingSemester = semesters
      ? get_ongoing_semester(semesters)
      : undefined;
    const lectures = (user && ongoingSemester)
      ? user.my_timetable_lectures.filter((l) => (
        (l.year === ongoingSemester.year) && (l.semester === ongoingSemester.semester)
      ))
      : [];
    const day = today.getDay();

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--feed')}>
      <div className={classNames('section-content', 'section-content--feed', 'section-content--todays-timetable')} ref={this.scrollRef}>
        <Scroller noScrollX={false} noScrollY={true}>
          <div className={classNames('section-content--todays-timetable__table')}>
            <div>
              {
                range(8 * 2, 24 * 2).map((i) => {
                  if (i % 2 === 0) {
                    const hour = i / 2;
                    const hourValue = ((hour - 1) % 12) + 1;
                    if (hour % 6 === 0) {
                      return <div key={i}><strong>{hourValue}</strong></div>;
                    }
                    return <div key={i}><span>{hourValue}</span></div>;
                  }
                  if (i === (24 - 8) * 2 - 1) {
                    return <div key={i}><strong>12</strong></div>;
                  }
                  return <div key={i} />;
                })
              }
            </div>
            <div>
              {
                range(8 * 2, 24 * 2).map((i) => {
                  if (i % 2 === 0) {
                    const hour = i / 2;
                    if (hour % 6 === 0) {
                      return <div className={classNames('hcell-left', 'hcell-bold')} key={i} />;
                    }
                    return <div className={classNames('hcell-left')} key={i} />;
                  }
                  if (i === 24 * 2 - 1) {
                    return <div className={classNames('hcell-right', 'hcell-last')} key={i} />;
                  }
                  return <div className={classNames('hcell-right')} key={i} />;
                })
              }
            </div>
          </div>
          {
            lectures.map((l) => (
              l.classtimes
                .filter((ct) => (ct.day === day - 1))
                .map((ct) => (
                  <HorizontalTimetableTile
                    key={`${l.id}:${ct.day}:${ct.begin}`}
                    lecture={l}
                    classtime={ct}
                    cellWidth={cellWidth}
                    cellHeight={51}
                  />
                ))
            ))
          }
          <div
            className={classNames('section-content--todays-timetable__bar')}
            style={{
              top: 11 + 4 - 2,
              left: this._getBarLeftPosition(),
            }}
          >
            <div />
            <div />
          </div>
        </Scroller>
        <div className={classNames('buttons')}>
          <Link
            to={{ pathname: '/timetable', search: queryString.stringify({ startSemester: ongoingSemester, startInMyTable: true }) }}
            className={classNames('text-button')}
          >
            {t('ui.button.seeDetails')}
          </Link>
        </div>
      </div>
    </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  semesters: state.common.semester.semesters,
});

const mapDispatchToProps = (dispatch) => ({
});

TodaysTimetableSection.propTypes = {
  user: userShape,
  semesters: PropTypes.arrayOf(semesterShape),
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TodaysTimetableSection
  )
);
