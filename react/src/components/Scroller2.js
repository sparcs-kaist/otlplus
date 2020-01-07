import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Scrollbar from 'react-scrollbars-custom';


class Scroller extends Component {
  contentRenderer = (props) => {
    const { elementRef, children, ...restProps } = props;
    return (
      <div {...restProps} ref={elementRef} className="Content">
        <div style={{ marginBottom: '12px' }}>
          {children}
        </div>
      </div>
    );
  }

  render() {
    const { onScroll, children } = this.props;

    return (
      <Scrollbar
        style={{
          flex: 'auto',
          marginBottom: '-12px',
        }}
        wrapperProps={{
          style: {
            right: '0',
          },
        }}
        contentProps={{
          style: {
            width: '1px',
            height: '1px',
          },
        }}
        trackXProps={{
          style: {
            left: '0',
            bottom: '0',
            height: '12px',
            width: '100%',
            backgroundColor: 'transparent',
          },
        }}
        trackYProps={{
          style: {
            top: '0',
            right: '-12px',
            width: '12px',
            height: 'calc(100% - 12px)',
            backgroundColor: 'transparent',
          },
        }}
        thumbXProps={{
          style: {
            height: '4px',
            borderRadius: '2px',
            margin: '4px 0',
          },
        }}
        thumbYProps={{
          style: {
            width: '4px',
            borderRadius: '2px',
            margin: '0 4px',
          },
        }}
        onScroll={onScroll}
      >
        { children }
      </Scrollbar>
    );
  }
}

Scroller.propTypes = {
  onScroll: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.oneOfType([
        // Add more nesting if needed
        PropTypes.string,
        PropTypes.element,
      ])),
      PropTypes.string,
      PropTypes.element,
    ])),
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
};

export default Scroller;
