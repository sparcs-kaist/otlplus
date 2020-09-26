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

  render() {
    const {
      onScroll,
      children,
      noScrollX, noScrollY,
      expandBottom,
    } = this.props;
    const { isScrolling, isMouseIn } = this.state;

    return (
      <Scrollbar
        className={[(noScrollX ? 'noX' : ''), (noScrollY ? 'noY' : '')].join(' ')}
        style={{
          flex: 'auto',
          marginBottom: `-${expandBottom}px`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: 'calc(100% + 12px)',
          height: 'initial',
          marginRight: '-12px',
          paddingRight: '12px',
        }}
        wrapperProps={{
          style: noScrollY
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
            minHeight: `calc(100% - ${expandBottom}px`,
            marginBottom: `${expandBottom}px`,
            width: (noScrollX ? undefined : 'fit-content'),
            height: (noScrollY ? undefined : 'fit-content'),
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
            height: `calc(100% - ${expandBottom}px)`,
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
          await new Promise((r) => setTimeout(r, 400));
          this.setState({ isScrolling: false });
        }}
        minimalThumbSize={24}
        noScrollX={noScrollX}
        noScrollY={noScrollY}
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
  expandBottom: PropTypes.number,
};

Scroller.defaultProps = {
  noScrollX: true,
  noScrollY: false,
  expandBottom: 12,
  expandRight: 12,
};

export default Scroller;
