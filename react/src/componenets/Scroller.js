import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'nanoscroller';
import PropTypes from 'prop-types';

import '../static/css/nanoscroller.css';


class Scroller extends Component {
  componentDidMount() {
    // eslint-disable-next-line fp/no-mutation
    this.scrollContainer = $(ReactDOM.findDOMNode(this.refs['scroll-container']));
    this.scrollContainer.nanoScroller();
  }

  componentWillUnmount() {
    this.scrollContainer.nanoScroller({ destroy: true });
  }

  render() {
    return (
      <div ref="scroll-container" onScroll={this.props.onScroll} className="nano">
        <div className="list-scroll nano-content">
          {this.props.children}
        </div>
      </div>
    );
  }
}

Scroller.propTypes = {
  onScroll: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]).isRequired,
};

export default Scroller;
