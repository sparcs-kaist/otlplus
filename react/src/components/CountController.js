import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class CountController extends Component {
  render() {
    const {
      count,
      updateFunct,
    } = this.props;

    return (
      <div className={classNames('course-status--info--controller')}>
        <i
          className={classNames('icon', 'icon--planner-minus')}
          onClick={() => {
            if (count > 0) {
              updateFunct(count - 1);
            }
          }}
        />
        <div>{ count }</div>
        <i
          className={classNames('icon', 'icon--planner-plus')}
          onClick={() => {
            updateFunct(count + 1);
          }}
        />
      </div>
    );
  }
}

CountController.propTypes = {
  count: PropTypes.number,
  updateFunct: PropTypes.func,
};

export default withTranslation()(
  CountController
);
