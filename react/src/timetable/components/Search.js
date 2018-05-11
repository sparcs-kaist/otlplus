import React, { Component } from 'react';
import { connect } from "react-redux";
import axios from 'axios';
import { closeSearch, fetchSearch } from "../actions";
import SearchFilter from './SearchFilter'

import '../../static/css/font-awesome.min.css';

axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';

let groupLectures = (lectures) => {
    if (lectures.length === 0)
        return [];

    let courses = [[lectures[0]]];
    for (let i=1, lecture; lectures[i]!==undefined; i++) {
        lecture=lectures[i];
        if (lecture.course === courses[courses.length-1][0].course)
            courses[courses.length-1].push(lecture);
        else
            courses.push([lecture]);
    }
    return courses;
};

class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputVal: "",
            type: new Set(["ALL"]),
            department: new Set(["ALL"]),
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(!nextProps.open) {
            return {
                inputVal: "",
                type:new Set(["ALL"]),
                department:new Set(["ALL"])
            };//When Close the Search, initialize the state
        }
        return null;
    }

    componentDidUpdate(){
        console.log('type',this.state.type);
        console.log('department',this.state.department);
    }

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

    clickCircle(filter_) {
        const filterName = filter_.name;
        const value = filter_.value;
        const isChecked = filter_.isChecked;
        if(isChecked){
            this.setState((prevState)=>{
                let filter = prevState[filterName];
                if(value ==="ALL" )
                    filter.clear();
                filter.add(value);
                return prevState;
            });
        }else{
            this.setState((prevState)=>{
                let filter = prevState[filterName];
                filter.delete(value);
                return prevState;
            });
        }
    }

    handleInput(e) {
        this.setState({
            inputVal: e.target.value
        });
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
                                           autoComplete="off" placeholder="검색" value={this.state.inputVal} onChange={(e)=>this.handleInput(e)}/>
                                    <div className="search-keyword-autocomplete">
                                        <span className="search-keyword-autocomplete-space"/>
                                        <span className="search-keyword-autocomplete-body"/>
                                    </div>
                                </div>
                            </div>
                            <SearchFilter
                                clickCircle = {this.clickCircle.bind(this)}
                                inputName = 'type'
                                titleName = '구분'
                            />
                            <SearchFilter
                                clickCircle = {this.clickCircle.bind(this)}
                                inputName = 'department'
                                titleName = '학과'
                            />
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
