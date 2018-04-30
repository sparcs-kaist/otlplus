import React, { Component } from 'react';
import { connect } from "react-redux";
import axios from 'axios';
import { closeSearch, fetchSearch } from "../actions";

axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';

let groupLectures = (lectures) => {
    if (lectures.length === 0)
        return [];

    let courses = [[lectures[0]]];
    for (let i=1, lecture; lecture=lectures[i]; i++) {
        if (lecture.course === courses[courses.length-1][0].course)
            courses[courses.length-1].push(lecture);
        else
            courses.push([lecture]);
    }
    return courses;
};

class Search extends Component {
    hideSearch() {
        this.props.closeSearchDispatch();
    }

    searchStart() {
        this.props.closeSearchDispatch();

        // Temporary. Change this to search later
        let url = Math.random()>0.5 ? "/api/timetable/list_load_major/" : "/api/timetable/list_load_humanity/";
        axios.post(url, {
            year: 2018,
            semester: 1,
        })
        .then((response) => {
            let lectures = response.data;
            let courses = groupLectures(lectures);
            this.props.fetchSearchDispatch(courses);
        })
        .catch((response) => {console.log(response);});
    }

    render() {
        if (! this.props.open) {
            return <div/>;
        }
        else {
            return (
                <div className="search-extend">
                    <div className="search-form-wrap">
                        <form method="post">
                            <div className="search-keyword">
                                <i className="search-keyword-icon"/>
                                <div className="search-keyword-text-wrap">
                                    <input className="search-keyword-text" type="text" name="keyword"
                                           autoComplete="off" placeholder="검색"/>
                                    <div className="search-keyword-autocomplete">
                                        <span className="search-keyword-autocomplete-space"/>
                                        <span className="search-keyword-autocomplete-body"/>
                                    </div>
                                </div>
                            </div>
                            <div className="search-filter">
                                <label
                                    className="search-filter-title fixed-ko"/>
                                <div className="search-filter-elem">
                                    <label>
                                        <input className="chkall" type="checkbox" autoComplete="off" name="type"
                                               value="ALL"/>
                                        전체
                                        <i className="fa fa-circle-o fa-1x none"/>
                                        <i className="fa fa-check-circle-o fa-1x"/>
                                    </label>
                                    <label>
                                        <input className="chkelem" type="checkbox" autoComplete="off" name="type"
                                               value="GR"/>
                                        공통
                                        <i className="fa fa-circle-o fa-1x"/>
                                        <i className="fa fa-check-circle-o fa-ix none"/>
                                    </label>
                                </div>
                            </div>
                            <div className="search-filter search-filter-time">
                                <label
                                    className="search-filter-title fixed-ko">시간</label>
                                <div className="search-filter-elem">
                                    <label>
                                        시간표에서 드래그
                                    </label>
                                </div>
                                <input id="search-filter-time-day" name="day" type="text"/>
                                <input id="search-filter-time-begin" name="begin" type="text"/>
                                <input id="search-filter-time-end" name="end" type="text"/>
                            </div>
                            <div style={{height: '13px'}}>
                                <span type="button" id="search-button" onClick={()=>this.searchStart()}>검색</span>
                                <span type="button" id="search-cancel" onClick={()=>this.hideSearch()}>취소</span>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }
    }
}

let mapStateToProps = (state) => {
    return {
        open : state.search.open,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        closeSearchDispatch : () => {
            dispatch(closeSearch());
        },
        fetchSearchDispatch : (courses) => {
            dispatch(fetchSearch(courses));
        }
    }
};

Search = connect(mapStateToProps, mapDispatchToProps)(Search);

export default Search;
