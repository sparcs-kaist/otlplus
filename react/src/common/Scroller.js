import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import nanoScroller from 'nanoscroller';

import '../static/css/nanoscroller.css';



class Scroller extends Component {
    componentDidMount() {
        this.scrollContainer = $(ReactDOM.findDOMNode(this.refs['scroll-container']));
        this.scrollContainer.nanoScroller();
    }

    componentWillUnmount() {
        this.scrollContainer.nanoScroller({destroy : true});
    }

    render() {
        return (
            <div ref="scroll-container" {...this.props} className="nano">
                <div className="list-scroll nano-content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Scroller;
