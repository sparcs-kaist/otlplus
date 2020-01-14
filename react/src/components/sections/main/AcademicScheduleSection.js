import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import semesterShape from '../../../shapes/SemesterShape';

import { getCurrentSchedule } from '../../../common/semesterFunctions';


class AcademicScheduleSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      today: new Date(),
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => this.setState({ today: new Date() }), 100);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


  render() {
    const { t } = this.props;
    const { today } = this.state;
    const { semesters } = this.props;

    if (semesters == null) {
      return (
        <div className={classNames('section-content', 'section-content--widget')}>
          <div className={classNames('academic-schedule', 'placeholder')}>
            <div>{t('ui.placeholder.loading')}</div>
            <div>
              <strong>-</strong>
              <span>-</span>
            </div>
          </div>
          <div className={classNames('buttons')}>
            <a href="https://ssogw6.kaist.ac.kr" className={classNames('text-button')} target="_blank" rel="noopener noreferrer">
              {t('ui.button.goToAcademicSystem')}
            </a>
          </div>
        </div>
      );
    }

    const semesterNames = {
      1: t('ui.semester.spring'),
      2: t('ui.semester.summer'),
      3: t('ui.semester.fall'),
      4: t('ui.semester.winter'),
    };

    const targetSchedule = getCurrentSchedule(semesters);

    if (!targetSchedule) {
      return (
        <div className={classNames('section-content', 'section-content--widget')}>
          <div className={classNames('academic-schedule', 'placeholder')}>
            <div>{t('ui.placeholder.unknown')}</div>
            <div>
              <strong>-</strong>
              <span>-</span>
            </div>
          </div>
          <div className={classNames('buttons')}>
            <a href="https://ssogw6.kaist.ac.kr" className={classNames('text-button')} target="_blank" rel="noopener noreferrer">
              {t('ui.button.goToAcademicSystem')}
            </a>
          </div>
        </div>
      );
    }

    const targetScheduleTime = targetSchedule.time;
    const timeDiff = targetScheduleTime - today;

    const seconds = Math.floor((timeDiff / 1000) % 60);
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    const getScheduleName = schedule => (
      t(`ui.schedule.${schedule.type}`)
    );

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('academic-schedule')}>
          <div>
            {`D-${t('ui.others.dayCount', { count: days })} ${t('ui.others.hourCount', { count: hours })} ${t('ui.others.minuteCount', { count: minutes })} ${t('ui.others.secondCount', { count: seconds })}`}
          </div>
          <div>
            <strong>{`${targetSchedule.year} ${semesterNames[targetSchedule.semester]} ${getScheduleName(targetSchedule)}`}</strong>
            <span>{`${targetScheduleTime.getFullYear()}.${targetScheduleTime.getMonth() + 1}.${targetScheduleTime.getDate()}`}</span>
          </div>
        </div>
        <div className={classNames('buttons')}>
          <a href="https://ssogw6.kaist.ac.kr" className={classNames('text-button')} target="_blank" rel="noopener noreferrer">
            {t('ui.button.goToAcademicSystem')}
          </a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  semesters: state.common.semester.semesters,
});

const mapDispatchToProps = dispatch => ({
});

AcademicScheduleSection.propTypes = {
  semesters: PropTypes.arrayOf(semesterShape),
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(AcademicScheduleSection));
