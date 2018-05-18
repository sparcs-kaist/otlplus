import React, { Component } from 'react';
import { connect } from "react-redux";
import { addLectureToTimetable, addLectureToCart, deleteLectureFromCart } from "../actions";
import { setLectureActive, clearLectureActive } from "../actions";
import { LIST } from "../reducers/lectureActive";

class ListBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isClicked:false,
            isHover:false,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        //Return value will be set the state
        if(nextProps.lectureActiveClicked) {
            if (nextProps.activeLecture.id !== nextProps.lecture.id) {
                if (prevState.isClicked) {
                    return {isClicked: false,isHover:false};
                }
            }
        }
        else if(prevState.isClicked && nextProps.activeLecture === null) {
            return {isClicked:false, isHover:false};
        }
    }

    addToTable() {
        for (let i=0, thisClasstime; (thisClasstime=this.props.lecture.classtimes[i]); i++)
            for (let j=0, lecture; (lecture=this.props.currentTimetable.lectures[j]); j++)
                for (let k=0, classtime; (classtime=lecture.classtimes[k]); k++)
                    if ((classtime.begin < thisClasstime.end) && (classtime.end > thisClasstime.begin)) {
                        alert(false ? "You can't add lecture overlapping." : '시간표가 겹치는 과목은 추가할 수 없습니다.');
                        return;
                    }

        this.props.addLectureToTimetableDispatch(this.props.lecture);
    }

    addToCart() {
        this.props.addLectureToCartDispatch(this.props.lecture);
    }

    deleteFromCart() {
        this.props.deleteLectureFromCartDispatch(this.props.lecture);
    }

    listHover() {
        if (this.props.lectureActiveClicked)
            return;
        this.props.setLectureActiveDispatch(this.props.lecture, LIST, false);
        this.setState({
            isHover:true,
        })
    };

    listOut() {
        if (this.props.lectureActiveClicked)
            return;
        this.props.clearLectureActiveDispatch();
        this.setState({
            isHover:false,
        })
    };

    onClick() {
        if(!this.state.isClicked){
            this.props.setLectureActiveDispatch(this.props.lecture, "LIST", true);
            this.setState({
                isClicked:true,
            });
        }else{
            this.props.setLectureActiveDispatch(this.props.lecture, "LIST", false);
            this.setState({
                isClicked:false,
            });
        }
    }


    render() {
        const getClass = (lecture) => {
            switch(lecture.class_title.length) {
                case 1:
                    return "class-title fixed-1";
                case 2:
                    return "class-title fixed-2";
                default:
                    return "class-title";
            }
        };
        const change = this.state.isClicked||this.state.isHover ? "click" : "";
        return (
            <div className={"list-elem-body-wrap "+change} onClick={()=>this.onClick()} onMouseOver={()=>this.listHover()} onMouseOut={()=>this.listOut()}>
                <div className="list-elem-body">
                    <div className="list-elem-body-text">
                        <strong className={getClass(this.props.lecture)}>{this.props.lecture.class_title}</strong>
                        &nbsp;
      	                <span className="class-prof">{this.props.lecture.professor_short}</span>
                    </div>
                    {
                        this.props.fromCart
                        ? <div className="delete-from-cart" onClick={()=>this.deleteFromCart()}><i/></div>
                        : (
                            !this.props.inCart
                            ? <div className="add-to-cart" onClick={()=>this.addToCart()}><i/></div>
                            : <div className="add-to-cart disable"><i/></div>
                        )
                    }
                    {
                        !this.props.inTimetable
                        ? <div className="add-to-table" onClick={()=>this.addToTable()}><i/></div>
                        : <div className="add-to-table disable"><i/></div>
                    }
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currentTimetable : state.timetable.currentTimetable,
        lectureActiveClicked : state.lectureActive.clicked,
        activeLecture : state.lectureActive.lecture,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        addLectureToTimetableDispatch : (lecture) => {
            dispatch(addLectureToTimetable(lecture));
        },
        setLectureActiveDispatch : (lecture, from, clicked) => {
            dispatch(setLectureActive(lecture, from, clicked));
        },
        clearLectureActiveDispatch : () => {
            dispatch(clearLectureActive());
        },
        addLectureToCartDispatch : (lecture) => {
            dispatch(addLectureToCart(lecture));
        },
        deleteLectureFromCartDispatch : (lecture) => {
            dispatch(deleteLectureFromCart(lecture));
        },
    }
};

ListBlock = connect(mapStateToProps, mapDispatchToProps)(ListBlock);

export default ListBlock;
