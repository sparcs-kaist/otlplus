import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class Divider extends Component {
  static Orientation = {
    HORIZONTAL: 'HORIZONTAL',
    VERTICAL: 'VERTICAL',
  }

  render() {
    const { orientation, isVisible, gridArea } = this.props;

    const orientationOnDesktop = (typeof orientation === 'string') ? orientation : orientation.desktop;
    const orientationOnMobile = (typeof orientation === 'string') ? orientation : orientation.mobile;
    const isVisibleOnDesktop = (typeof isVisible === 'boolean') ? isVisible : isVisible.desktop;
    const isVisibleOnMobile = (typeof isVisible === 'boolean') ? isVisible : isVisible.mobile;

    return (
      <div
        className={classNames(
          'divider',
          (orientationOnDesktop === Divider.Orientation.HORIZONTAL) ? 'divider--desktop-horizontal' : 'divider--desktop-vertical',
          (orientationOnMobile === Divider.Orientation.HORIZONTAL) ? 'divider--mobile-horizontal' : 'divider--mobile-vertical',
          isVisibleOnDesktop ? null : 'desktop-hidden',
          isVisibleOnMobile ? null : 'mobile-hidden',
        )}
        style={
          gridArea
            ? {
              gridArea: gridArea,
            }
            : null
        }
      />
    );
  }
}

const orientationType = PropTypes.oneOf([
  Divider.Orientation.HORIZONTAL,
  Divider.Orientation.VERTICAL,
]);

Divider.propTypes = {
  orientation: PropTypes.oneOfType([
    orientationType,
    PropTypes.shape({
      desktop: orientationType.isRequired,
      mobile: orientationType.isRequired,
    }),
  ]).isRequired,
  isVisible: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      desktop: PropTypes.bool.isRequired,
      mobile: PropTypes.bool.isRequired,
    }),
  ]).isRequired,
  gridArea: PropTypes.string,
};

export default Divider;
