import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class CourseStatus extends Component {
  render() {
    const {
      t,
      entries,
    } = this.props;

    return (
      <div>
        {
          entries.map((e) => (
            <div
              className={classNames(
                'course-status',
              )}
              key={e.name}
            >
              <div className={classNames('course-status--name')}>
                { e.name }
              </div>
              <div>
                {
                  e.info.map((k) => (
                    <div className={classNames('course-status--info')}>
                      <div className={classNames('course-status--info--name')}>{k.name}</div>
                      <div />
                      { k.controller }
                    </div>
                  ))
                }
              </div>
            </div>
          ))
        }
      </div>
    );
  }
}

CourseStatus.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      info: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    })
  ).isRequired,
};

export default withTranslation()(
  CourseStatus
);
