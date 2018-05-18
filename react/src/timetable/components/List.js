import React, { Component } from 'react';
import { connect } from "react-redux";
import { openSearch } from "../actions";
import Scroller from "../../common/Scroller";
import Search from "./Search";
import ListBlock from "./ListBlock";

class List extends Component {
    showSearch() {
        this.props.openSearchDispatch();
    }

    render() {
        const inTimetable = (lecture) => {
            for (let i=0; i<this.props.currentTimetable.lectures.length; i++)
                if (this.props.currentTimetable.lectures[i].id === lecture.id)
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
                    {this.props.major.map((majorList) => (
                        <button className="list-tab major"><i className="list-tab-icon"/></button>
                    ))}
                    <button className="list-tab humanity"><i className="list-tab-icon"/></button>
                    <button className="list-tab cart"><i className="list-tab-icon"/></button>
                </div>
                <div id="list-page-wrap">
                    <div className="list-page search-page">
                        <Search/>
                        <div className="list-page-title search-page-title" onClick={()=>this.showSearch()}>
                            <i className="search-page-title-icon"/>
                            <div className="search-page-title-text">검색</div>
                        </div>
                        <Scroller>
                            {this.props.search.courses.map(mapCourse)}
                        </Scroller>
                    </div>
                    {this.props.major.map((majorList) => (
                        <div className="list-page humanity-page none">
                            <div className="list-page-title">
                                {majorList.name} 전공
                            </div>
                            <Scroller>
                                {majorList.courses.map(mapCourse)}
                            </Scroller>
                        </div>
                    ))}
                    <div className="list-page humanity-page none">
                        <div className="list-page-title">
                            인문사회선택
                        </div>
                        <Scroller>
                            {this.props.humanity.courses.map(mapCourse)}
                        </Scroller>
                    </div>
                    <div className="list-page cart-page none">
                        <div className="list-page-title">
                            장바구니
                        </div>
                        <Scroller>
                            {this.props.cart.courses.map(mapCourse)}
                        </Scroller>
                    </div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        search : state.list.search,
        major : state.list.major,
        humanity : state.list.humanity,
        cart : state.list.cart,
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
