import React, { Component } from 'react';
import { connect } from "react-redux";
import { addLectureToTimetable } from "../actions";
import { setLectureActive, clearLectureActive } from "../actions";
import addCartIcon from '../../static/icons/add_cart.svg';
import addCartDisabledIcon from '../../static/icons/add_cart_disabled.svg';
import deleteCartIcon from '../../static/icons/delete_cart.svg';
import addLectureIcon from '../../static/icons/add_lecture.svg';
import addLectureDisabledIcon from '../../static/icons/add_lecture_disabled.svg';

class ListBlock extends Component {
    addToTable() {
        for (let i=0, thisClasstime; thisClasstime=this.props.lecture.classtimes[i]; i++)
            for (let j=0, lecture; lecture=this.props.currentTimetable[j]; j++)
                for (let k=0, classtime; classtime=lecture.classtimes[k]; k++)
                    if ((classtime.begin < thisClasstime.end) && (classtime.end > thisClasstime.begin)) {
                        alert(false ? "You can't add lecture overlapping." : '시간표가 겹치는 과목은 추가할 수 없습니다.');
                        return;
                    }

        this.props.addLectureToTimetableDispatch(this.props.lecture);
    }

    listHover() {
        if (false)
            return;
        this.props.setLectureActiveDispatch(this.props.lecture, "LIST", false);
    };

    listOut() {
        if (false)
            return;
        this.props.clearLectureActiveDispatch();
    };


    render() {
        console.log("Render ListBlock");
        console.log(this.props);

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
                        ? <div className="add-to-cart"><i style={{backgroundImage:`url(${addCartIcon})`}}/></div>
                        : <div className="add-to-cart disable"><i style={{backgroundImage:`url(${addCartDisabledIcon})`}}/></div>
                    }
                    {
                        !this.props.inTimetable
                        ? <div className="add-to-table" onClick={()=>this.addToTable()}><i style={{backgroundImage:`url(${addLectureIcon})`}}/></div>
                        : <div className="add-to-table disable"><i style={{backgroundImage:`url(${addLectureDisabledIcon})`}}/></div>
                    }
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currentTimetable : state.timetable.currentTimetable,
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
