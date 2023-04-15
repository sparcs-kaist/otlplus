import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class CourseStatus extends Component {
  render() {
    const {
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
                    <div
                      className={classNames('course-status--info')}
                      onMouseOver={k.onMouseOver}
                      onMouseOut={k.onMouseOut}
                      key={k.name}
                    >
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
      info: PropTypes.arrayOf(PropTypes.exact({
        name: PropTypes.string.isRequired,
        controller: PropTypes.any.isRequired,
        onMouseOver: PropTypes.func,
        onMouseOut: PropTypes.func,
      })).isRequired,
    })
  ).isRequired,
};

export default withTranslation()(
  CourseStatus
);
