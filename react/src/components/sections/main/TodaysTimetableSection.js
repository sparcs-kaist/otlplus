import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import queryString from 'qs';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { TIMETABLE_START_HOUR, TIMETABLE_END_HOUR } from '../../../common/constants';

import Scroller from '../../Scroller';
import HorizontalTimetableTile from '../../tiles/HorizontalTimetableTile';

import userShape from '../../../shapes/model/session/UserShape';
import semesterShape from '../../../shapes/model/subject/SemesterShape';

import { getOngoingSemester } from '../../../utils/semesterUtils';
import { getColorNumber } from '../../../utils/lectureUtils';


class TodaysTimetableSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cellWidth: 0,
      cellHeight: 0,
      now: new Date(),
    };

    // eslint-disable-next-line fp/no-mutation
    this.scrollRef = React.createRef();
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
    this.interval = setInterval(() => this.setState({ now: new Date() }), 100);
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
      .getElementsByClassName(classNames('subsection--todays-timetable__table__body__cell'))[0]
      .getBoundingClientRect();
    this.setState({
      cellWidth: cell.width + 1,
      cellHeight: cell.height,
    });
  }

  _getBarLeftPosition = () => {
    const BAR_CIRCLE_WIDTH = 5;
    const BAR_LINE_WIDTH = 1;
    const TABLE_LEFT_MARGIN = 2;

    const { cellWidth, now } = this.state;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const floatHours = hours + (minutes / 60) + (seconds / 60 / 60);

    return (floatHours - TIMETABLE_START_HOUR) * cellWidth * 2
      + TABLE_LEFT_MARGIN
      - (BAR_CIRCLE_WIDTH - BAR_LINE_WIDTH) / 2;
  }

  render() {
    const { t } = this.props;
    const { cellWidth, cellHeight, now } = this.state;
    const { user, semesters } = this.props;

    const ongoingSemester = semesters
      ? getOngoingSemester(semesters)
      : undefined;
    const lectures = (user && ongoingSemester)
      ? user.my_timetable_lectures.filter((l) => (
        (l.year === ongoingSemester.year) && (l.semester === ongoingSemester.semester)
      ))
      : [];
    const day = now.getDay();

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--feed')}>
      <div className={classNames('subsection', 'subsection--feed', 'subsection--todays-timetable')} ref={this.scrollRef}>
        <Scroller noScrollX={false} noScrollY={true}>
          <div className={classNames('subsection--todays-timetable__table')}>
            <div className={classNames('subsection--todays-timetable__table__label')}>
              {
                [
                  ...(
                    range(TIMETABLE_START_HOUR, TIMETABLE_END_HOUR).map((h) => {
                      const HourTag = (h % 6 === 0) ? 'strong' : 'span';
                      return [
                        <div className={classNames('subsection--todays-timetable__table__label__line')} key={`line:${h * 60}`}>
                          <HourTag>{((h - 1) % 12) + 1}</HourTag>
                        </div>,
                        <div className={classNames('subsection--todays-timetable__table__label__cell')} key={`cell:${h * 60}`} />,
                        <div className={classNames('subsection--todays-timetable__table__label__line')} key={`line:${h * 60 + 30}`} />,
                        <div className={classNames('subsection--todays-timetable__table__label__cell')} key={`cell:${h * 60 + 30}`} />,
                      ];
                    })
                      .flat(1)
                  ),
                  <div className={classNames('subsection--todays-timetable__table__label__line')} key="line:1440">
                    <strong>{12}</strong>
                  </div>,
                ]
              }
            </div>
            <div className={classNames('subsection--todays-timetable__table__body')}>
              {
                [
                  ...(
                    range(TIMETABLE_START_HOUR, TIMETABLE_END_HOUR).map((h) => {
                      return [
                        <div
                          className={classNames(
                            'subsection--todays-timetable__table__body__line',
                            (h % 6 === 0) ? 'subsection--todays-timetable__table__body__line--bold' : null,
                          )}
                          key={`line:${h * 60}`}
                        />,
                        <div
                          className={classNames(
                            'subsection--todays-timetable__table__body__cell',
                          )}
                          key={`cell:${h * 60}`}
                        />,
                        <div
                          className={classNames(
                            'subsection--todays-timetable__table__body__line',
                            'subsection--todays-timetable__table__body__line--dashed',
                          )}
                          key={`line:${h * 60 + 30}`}
                        />,
                        <div
                          className={classNames(
                            'subsection--todays-timetable__table__body__cell',
                          )}
                          key={`cell:${h * 60 + 30}`}
                        />,
                      ];
                    })
                  ),
                  <div
                    className={classNames(
                      'subsection--todays-timetable__table__body__line',
                      'subsection--todays-timetable__table__body__line--bold',
                    )}
                    key="line:1440"
                  />,
                ]
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
                    beginIndex={ct.begin / 30 - TIMETABLE_START_HOUR * 2}
                    endIndex={ct.end / 30 - TIMETABLE_START_HOUR * 2}
                    color={getColorNumber(l)}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                  />
                ))
            ))
          }
          <div
            className={classNames('subsection--todays-timetable__bar')}
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
