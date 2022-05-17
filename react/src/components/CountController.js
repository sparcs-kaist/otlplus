import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class CountController extends Component {
  constructor(props) {
      super(props);
  }
    
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
              if(count > 0) updateFunct(count-1);
            }}>
          </i>
          <div>{ count }</div>
          <i
            className={classNames('icon', 'icon--planner-plus')}
            onClick={() => {
              updateFunct(count+1);
            }}>
          </i>
      </div>
    );
  }
}

CountController.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
        count: PropTypes.number,
    })
  ).isRequired,
};

export default withTranslation()(
  CountController
);
