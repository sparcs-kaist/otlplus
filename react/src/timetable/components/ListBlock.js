import React, { Component } from 'react';
import { connect } from "react-redux";
import { addLectureToTimetable } from "../actions";
import { setLectureActive, clearLectureActive } from "../actions";
import { LIST } from "../reducers/lectureActive";

class ListBlock extends Component {
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

    listHover() {
        if (this.props.lectureActiveClicked)
            return;
        this.props.setLectureActiveDispatch(this.props.lecture, LIST, false);
    };

    listOut() {
        if (this.props.lectureActiveClicked)
            return;
        this.props.clearLectureActiveDispatch();
    };


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
        return (
            <div className="list-elem-body-wrap" onMouseOver={()=>this.listHover()} onMouseOut={()=>this.listOut()}>
                <div className="list-elem-body">
                    <div className="list-elem-body-text">
                        <strong className={getClass(this.props.lecture)}>{this.props.lecture.class_title}</strong>
                        &nbsp;
      	                <span className="class-prof">{this.props.lecture.professor_short}</span>
                    </div>
                    {
                        !this.props.inCart
                        ? <div className="add-to-cart"><i/></div>
                        : <div className="add-to-cart disable"><i/></div>
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
    }
};

ListBlock = connect(mapStateToProps, mapDispatchToProps)(ListBlock);

export default ListBlock;
