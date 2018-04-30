import React, { Component } from 'react';
import { connect } from "react-redux";
import { openSearch } from "../actions";
import Search from "./Search";
import ListBlock from "./ListBlock";

class List extends Component {
    render() {
        const inTimetable = (lecture) => {
            for (let i=0; i<this.props.currentTimetable.length; i++)
                if (this.props.currentTimetable[i].id === lecture.id)
                    return true;
            return false;
        };

        const inCart = (lecture) => {
            return false;
        };

        const mapLecture = (lecture) => {
            return (
                <ListBlock lecture={lecture} key={lecture.id} inTimetable={inTimetable(lecture)} inCart={inCart(lecture)}/>
            )
        };

        const mapCourse = (course) => {
            return (
                <div className="list-elem" key={course[0].course}>
                    <div className="list-elem-title">
                        <strong>{course[0].common_title}</strong>
                        &nbsp;
                        {course[0].old_code}
                    </div>
                    {course.map(mapLecture)}
                </div>
            )
        };

        return (
            <div id="lecture-lists">
                <div id="list-tab-wrap">
                    <button className="list-tab search active"><i className="list-tab-icon"/></button>
                    <button className="list-tab humanity"><i className="list-tab-icon"/></button>
                    <button className="list-tab cart"><i className="list-tab-icon"/></button>
                </div>
                <div id="list-page-wrap">
                    <div className="list-page search-page">
                        <Search/>
                        <div className="list-page-title search-page-title" onClick={this.props.openSearchDispatch}>
                            <i className="search-page-title-icon"/>
                            <div className="search-page-title-text">검색</div>
                        </div>
                        <div className="nano">
                            <div className="list-scroll nano-content">
                                {this.props.courses.map(mapCourse)}
                            </div>
                        </div>
                    </div>
                    <div className="list-page cart-page none">
                        <div className="list-page-title">
                            장바구니
                        </div>
                        <div className="nano">
                            <div className="list-scroll nano-content">
                            </div>
                        </div>
                    </div>
                    <div className="list-page humanity-page none">
                        <div className="list-page-title">
                            인문사회선택
                        </div>
                        <div className="nano">
                            <div className="list-scroll nano-content">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        courses : state.list.courses,
        currentTimetable : state.timetable.currentTimetable,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        openSearchDispatch : () => {
            dispatch(openSearch());
        },
    }
};

List = connect(mapStateToProps, mapDispatchToProps)(List);

export default List;
