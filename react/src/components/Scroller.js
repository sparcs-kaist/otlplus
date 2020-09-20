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
    const { elementRef, children, marginBottom, ...restProps } = props;

    const calculatedMarginBottom = (marginBottom === undefined) ? 12 : marginBottom;
    return (
      <div {...restProps} ref={elementRef} className="Content">
        <div style={{ marginBottom: `${calculatedMarginBottom}px` }}>
          {children}
        </div>
      </div>
    );
  }

  render() {
    const { onScroll, children, noScrollX, noScrollY, marginBottom } = this.props;
    const { isScrolling, isMouseIn } = this.state;

    const calculatedNoScrollX = (noScrollX === undefined) ? true : noScrollX;
    const calculatedNoScrollY = (noScrollY === undefined) ? false : noScrollY;
    const calculatedMarginBottom = (marginBottom === undefined) ? 12 : marginBottom;

    return (
      <Scrollbar
        className={[(calculatedNoScrollX ? 'noX' : ''), (calculatedNoScrollY ? 'noY' : '')].join(' ')}
        style={{
          flex: 'auto',
          marginBottom: `-${calculatedMarginBottom}px`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: 'calc(100% + 12px)',
          marginRight: '-12px',
          paddingRight: '12px',
        }}
        wrapperProps={{
          style: calculatedNoScrollY
            ? {
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
            }
            : {
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
            },
        }}
        scrollerProps={{
          style:
            {
              flex: '1 1 auto',
            },
        }}
        contentProps={{
          style: {
            padding: '0',
            paddingRight: '1px',
            minWidth: '100%',
            minHeight: `calc(100% - ${calculatedMarginBottom}px`,
            marginBottom: `${calculatedMarginBottom}px`,
            width: (calculatedNoScrollX ? undefined : 'fit-content'),
            height: (calculatedNoScrollY ? undefined : 'fit-content'),
            overflow: 'hidden',
          },
        }}
        trackXProps={{
          style: {
            left: '0',
            bottom: '0',
            height: '12px',
            width: 'calc(100% - 12px)',
            backgroundColor: 'transparent',
            transition: 'opacity 0.3s',
            opacity: isScrolling ? '1' : (isMouseIn ? '0.25' : '0'),
          },
        }}
        trackYProps={{
          style: {
            top: '0',
            right: '0',
            width: '12px',
            height: `calc(100% - ${calculatedMarginBottom}px)`,
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
  children: PropTypes.node.isRequired,
  noScrollX: PropTypes.bool,
  noScrollY: PropTypes.bool,
  marginBottom: PropTypes.number,
};

export default Scroller;
