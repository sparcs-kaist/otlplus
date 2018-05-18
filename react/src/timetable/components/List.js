import React, { Component } from 'react';
import { connect } from "react-redux";
import { openSearch, setCurrentList } from "../actions";
import Scroller from "../../common/Scroller";
import Search from "./Search";
import ListBlock from "./ListBlock";

class List extends Component {
    changeTab(list) {
        this.props.setCurrentListDispatch(list);
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
            for (let i=0, course; course=this.props.cart.courses[i]; i++)
                for (let j=0, cartLecture; cartLecture=course[j]; j++)
                    if (cartLecture.id === lecture.id)
                        return true;
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
                    <button className={"list-tab search"+(this.props.currentList==="SEARCH"?" active":"")} onClick={()=>this.changeTab("SEARCH")}><i className="list-tab-icon"/></button>
                    {this.props.major.map((majorList) => (
                        <button className={"list-tab major"+(this.props.currentList===majorList.code?" active":"")} onClick={()=>this.changeTab(majorList.code)}><i className="list-tab-icon"/></button>
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
                            {this.props.search.courses.map(mapCourse)}
                        </Scroller>
                    </div>
                    {this.props.major.map((majorList) => (
                        <div className={"list-page humanity-page"+(this.props.currentList===majorList.code?"":" none")}>
                            <div className="list-page-title">
                                {majorList.name} 전공
                            </div>
                            <Scroller>
                                {majorList.courses.map(mapCourse)}
                            </Scroller>
                        </div>
                    ))}
                    <div className={"list-page humanity-page"+(this.props.currentList==="HUMANITY"?"":" none")}>
                        <div className="list-page-title">
                            인문사회선택
                        </div>
                        <Scroller>
                            {this.props.humanity.courses.map(mapCourse)}
                        </Scroller>
                    </div>
                    <div className={"list-page cart-page"+(this.props.currentList==="CART"?"":" none")}>
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
        currentList : state.list.currentList,
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
        setCurrentListDispatch : (list) => {
            dispatch(setCurrentList(list));
        },
    }
};

List = connect(mapStateToProps, mapDispatchToProps)(List);

export default List;
