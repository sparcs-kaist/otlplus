import React, { Component } from 'react';
import { connect } from "react-redux";
import { openSearch, closeSearch, setCurrentList, clearLectureActive } from "../actions";
import Scroller from "../../common/Scroller";
import Search from "./Search";
import ListBlock from "./ListBlock";
import { LIST, TABLE } from "../reducers/lectureActive";

class List extends Component {
    changeTab(list) {
        this.props.setCurrentListDispatch(list);
        
        if (list==="SEARCH" && this.props.search.courses.length===0)
            this.props.openSearchDispatch();
        else
            this.props.closeSearchDispatch();

        if (this.props.lectureActiveFrom === LIST)
            this.props.clearLectureActiveDispatch();
    }

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
            for (let i=0, course; (course=this.props.cart.courses[i]); i++)
                for (let j=0, cartLecture; (cartLecture=course[j]); j++)
                    if (cartLecture.id === lecture.id)
                        return true;
            return false;
        };

        const isClicked = (course) => {
            if (this.props.lectureActiveFrom!==LIST && this.props.lectureActiveFrom!==TABLE)
                return false;
            if (!this.props.lectureActiveClicked)
                return false;

            return (this.props.lectureActiveLecture.course === course[0].course);
        };

        const mapLecture = (fromCart) => (lecture) => {
            return (
                <ListBlock lecture={lecture} key={lecture.id} inTimetable={inTimetable(lecture)} inCart={inCart(lecture)} fromCart={fromCart}/>
            )
        };

        const mapCourse = (fromCart) => (course) => {
            return (
                <div className={"list-elem"+(isClicked(course)?" click":"")} key={course[0].course}>
                    <div className="list-elem-title">
                        <strong>{course[0].common_title}</strong>
                        &nbsp;
                        {course[0].old_code}
                    </div>
                    {course.map(mapLecture(fromCart))}
                </div>
            )
        };

        const listBlocks = (courses, fromCart) => {
            if (courses.length === 0)
                return <div className="list-loading">결과 없음</div>;
            else
                return courses.map(mapCourse(fromCart));
        };

        return (
            <div id="lecture-lists">
                <div id="list-tab-wrap">
                    <button className={"list-tab search"+(this.props.currentList==="SEARCH"?" active":"")} onClick={()=>this.changeTab("SEARCH")}><i className="list-tab-icon"/></button>
                    {this.props.major.map((majorList) => (
                        <button className={"list-tab major"+(this.props.currentList===majorList.code?" active":"")} key={majorList.code} onClick={()=>this.changeTab(majorList.code)}><i className="list-tab-icon"/></button>
                    ))}
                    <button className={"list-tab humanity"+(this.props.currentList==="HUMANITY"?" active":"")} onClick={()=>this.changeTab("HUMANITY")}><i className="list-tab-icon"/></button>
                    <button className={"list-tab cart"+(this.props.currentList==="CART"?" active":"")} onClick={()=>this.changeTab("CART")}><i className="list-tab-icon"/></button>
                </div>
                <div id="list-page-wrap">
                    <div className={"list-page search-page"+(this.props.currentList==="SEARCH"?"":" none")}>
                        <Search/>
                        <div className="list-page-title search-page-title" onClick={()=>this.showSearch()}>
                            <i className="search-page-title-icon"/>
                            <div className="search-page-title-text">검색</div>
                        </div>
                        <Scroller>
                            {listBlocks(this.props.search.courses, false)}
                        </Scroller>
                    </div>
                    {this.props.major.map((majorList) => (
                        <div className={"list-page humanity-page"+(this.props.currentList===majorList.code?"":" none")} key={majorList.code}>
                            <div className="list-page-title">
                                {majorList.name} 전공
                            </div>
                            <Scroller>
                                {listBlocks(majorList.courses, false)}
                            </Scroller>
                        </div>
                    ))}
                    <div className={"list-page humanity-page"+(this.props.currentList==="HUMANITY"?"":" none")}>
                        <div className="list-page-title">
                            인문사회선택
                        </div>
                        <Scroller>
                            {listBlocks(this.props.humanity.courses, false)}
                        </Scroller>
                    </div>
                    <div className={"list-page cart-page"+(this.props.currentList==="CART"?"":" none")}>
                        <div className="list-page-title">
                            장바구니
                        </div>
                        <Scroller>
                            {listBlocks(this.props.cart.courses, true)}
                        </Scroller>
                    </div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currentList : state.list.currentList,
        search : state.list.search,
        major : state.list.major,
        humanity : state.list.humanity,
        cart : state.list.cart,
        currentTimetable : state.timetable.currentTimetable,
        lectureActiveFrom : state.lectureActive.from,
        lectureActiveClicked : state.lectureActive.clicked,
        lectureActiveLecture : state.lectureActive.lecture,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        openSearchDispatch : () => {
            dispatch(openSearch());
        },
        closeSearchDispatch : () => {
            dispatch(closeSearch());
        },
        setCurrentListDispatch : (list) => {
            dispatch(setCurrentList(list));
        },
        clearLectureActiveDispatch : () => {
            dispatch(clearLectureActive());
        },
    }
};

List = connect(mapStateToProps, mapDispatchToProps)(List);

export default List;
