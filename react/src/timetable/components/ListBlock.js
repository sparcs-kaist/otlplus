import React, { Component } from 'react';
import { connect } from "react-redux";
import axios from "../../common/presetAxios";
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
        else
            return null;
    }

    addToTable(event) {
        event.stopPropagation();
        for (let i=0, thisClasstime; (thisClasstime=this.props.lecture.classtimes[i]); i++)
            for (let j=0, lecture; (lecture=this.props.currentTimetable.lectures[j]); j++)
                for (let k=0, classtime; (classtime=lecture.classtimes[k]); k++)
                    if ((classtime.begin < thisClasstime.end) && (classtime.end > thisClasstime.begin)) {
                        alert(false ? "You can't add lecture overlapping." : '시간표가 겹치는 과목은 추가할 수 없습니다.');
                        return;
                    }

        axios.post("/api/timetable/table_update", {
            table_id: this.props.currentTimetable.id,
            lecture_id: this.props.lecture.id,
            delete: false,
        })
        .then((response) => {
            console.log(response);
            this.props.addLectureToTimetableDispatch(this.props.lecture);
        })
        .catch((response) => {console.log(response);});
    }

    addToCart(event) {
        event.stopPropagation();
        this.props.addLectureToCartDispatch(this.props.lecture);
    }

    deleteFromCart(event) {
        event.stopPropagation();
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
                        ? <div className="delete-from-cart" onClick={(event)=>this.deleteFromCart(event)}><i/></div>
                        : (
                            !this.props.inCart
                            ? <div className="add-to-cart" onClick={(event)=>this.addToCart(event)}><i/></div>
                            : <div className="add-to-cart disable"><i/></div>
                        )
                    }
                    {
                        !this.props.inTimetable
                        ? <div className="add-to-table" onClick={(event)=>this.addToTable(event)}><i/></div>
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
