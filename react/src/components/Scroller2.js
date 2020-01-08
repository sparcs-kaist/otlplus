import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Scrollbar from 'react-scrollbars-custom';


class Scroller extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isScrolling: false,
    };
  }

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
    const { onScroll, children, hasScrollX } = this.props;
    const { isScrolling } = this.state;

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
            transition: 'opacity 0.3s',
            opacity: isScrolling ? '1' : '0.01',
          },
        }}
        trackYProps={{
          style: {
            top: '0',
            right: '-12px',
            width: '12px',
            height: 'calc(100% - 12px)',
            backgroundColor: 'transparent',
            transition: 'opacity 0.3s',
            opacity: isScrolling ? '1' : '0.01',
          },
        }}
        thumbXProps={{
          style: {
            height: '4px',
            borderRadius: '2px',
            margin: '4px 0',
            backgroundColor: 'rgba(128, 128, 128, 0.3)',
          },
        }}
        thumbYProps={{
          style: {
            width: '4px',
            borderRadius: '2px',
            margin: '0 4px',
            backgroundColor: 'rgba(128, 128, 128, 0.3)',
          },
        }}
        onMouseEnter={async () => {
          this.setState({ isScrolling: true });
          await new Promise(r => setTimeout(r, 1000));
          this.setState({ isScrolling: false });
        }}
        onScroll={() => {
          this.setState({ isScrolling: true });
          if (onScroll) {
            onScroll();
          }
        }}
        onScrollStop={async () => {
          await new Promise(r => setTimeout(r, 400));
          this.setState({ isScrolling: false });
        }}
        minimalThumbSize={24}
        noScrollX={!hasScrollX}
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
  hasScrollX: PropTypes.bool,
};

export default Scroller;
