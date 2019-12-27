import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';


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

    const targetScheduleTime = new Date(2020, 3, 2);
    const timeDiff = targetScheduleTime - today;

    const seconds = Math.floor((timeDiff / 1000) % 60);
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('academic-schedule')}>
          <div>
            {`D-${t('ui.others.dayCount', { count: days })} ${t('ui.others.hourCount', { count: hours })} ${t('ui.others.minuteCount', { count: minutes })} ${t('ui.others.secondCount', { count: seconds })}`}
          </div>
          <div>
            <strong>{`${t('ui.semester.springSemester')} ${t('ui.schedule.courseDropDeadline')}`}</strong>
            <span>{`${targetScheduleTime.getFullYear()}.${targetScheduleTime.getMonth()}.${targetScheduleTime.getDate()}`}</span>
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


export default withTranslation()(AcademicScheduleSection);
