import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Scrollbar from 'react-scrollbars-custom';


class Scroller extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMouseIn: false,
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
    const { onScroll, children, noScrollX, noScrollY } = this.props;
    const { isScrolling, isMouseIn } = this.state;

    const calculatedNoScrollX = (noScrollX === undefined) ? true : noScrollX;
    const calculatedNoScrollY = (noScrollY === undefined) ? false : noScrollY;

    return (
      <Scrollbar
        className={[(calculatedNoScrollX ? 'noX' : ''), (calculatedNoScrollY ? 'noY' : '')].join(' ')}
        style={{
          flex: 'auto',
          marginBottom: '-12px',
        }}
        wrapperProps={{
          style: calculatedNoScrollY
            ? {
            }
            : {
              right: '0',
            },
        }}
        scrollerProps={{
          style:
            {
              top: 'initial',
              bottom: 'initial',
              left: 'initial',
              right: 'initial',
              position: 'initial',
              height: '100%',
            },
        }}
        contentProps={{
          style: {
            padding: '0',
            width: '100%',
            height: '100%',
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
            opacity: isScrolling ? '1' : (isMouseIn ? '0.25' : '0'),
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
            opacity: isScrolling ? '1' : (isMouseIn ? '0.25' : '0'),
          },
        }}
        thumbXProps={{
          style: {
            height: '4px',
            borderRadius: '2px',
            margin: '4px 0',
            backgroundColor: 'rgba(128, 128, 128, 0.4)',
          },
        }}
        thumbYProps={{
          style: {
            width: '4px',
            borderRadius: '2px',
            margin: '0 4px',
            backgroundColor: 'rgba(128, 128, 128, 0.4)',
          },
        }}
        onMouseEnter={async () => {
          this.setState({ isMouseIn: true });
        }}
        onMouseLeave={async () => {
          this.setState({ isMouseIn: false });
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
        noScrollX={calculatedNoScrollX}
        noScrollY={calculatedNoScrollY}
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
  noScrollX: PropTypes.bool,
  noScrollY: PropTypes.bool,
};

export default Scroller;
