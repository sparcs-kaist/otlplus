import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'nanoscroller';

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
            <div ref="scroll-container" onScroll={this.props.onScroll} className="nano">
                <div className="list-scroll nano-content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Scroller;
