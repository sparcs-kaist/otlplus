import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'nanoscroller';

import '../static/css/nanoscroller.css';



class Scroller extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isClicked:false,
            lectureId:undefined,
        };
    }

    componentDidMount() {
        this.scrollContainer = $(ReactDOM.findDOMNode(this.refs['scroll-container']));
        this.scrollContainer.nanoScroller();
    }

    static getDerivedStateFromProps(nextProps,prevState) {
        //Return value will be set the state
        if ((prevState.isClicked === false && nextProps.isClicked === true) ||
            (prevState.isClicked && prevState.lectureId !== nextProps.lectureId && nextProps.lectureId !== undefined )
        ){
            $('.lecture-detail .nano').nanoScroller({scrollTop: $('.open-dict-button').position().top - $('.nano-content > .basic-info:first-child').position().top + 1});
        }else if ((prevState.isClicked === true && nextProps.isClicked === false)) {
            $('.lecture-detail .nano').nanoScroller({scrollTop: 0});
        }
        return nextProps;
    }

    componentWillUnmount() {
        this.scrollContainer.nanoScroller({destroy : true});
    }

    handleScroll = () => {
        if($('.open-dict-button').position().top <= 1) {
            $('.dict-fixed').removeClass('none');
        } else {
            $('.dict-fixed').addClass('none');
        }
    };

    render() {
        return (
            <div ref="scroll-container" onScroll={()=>this.handleScroll()} className="nano">
                <div className="list-scroll nano-content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Scroller;
