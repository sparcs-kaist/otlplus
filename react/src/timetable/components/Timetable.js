import React, { Component } from 'react';
import {connect} from "react-redux";
import TimetableBlock from "./TimetableBlock";
import {dragSearch, setIsDragging, setSemester, updateCellSize} from "../actions";

class Timetable extends Component {
    constructor(props){
        super(props);
        this.isLookingTable = false;
        this.isBlockClick = false;
        this.state = {
            isBubbling : false,
            firstBlock : null,
            secondBlock : null,
            height : 0,
            width : 0,
            left : 0,
            top : 0,
        }
    }

    resize() {
        let cell = document.getElementsByClassName("cell1")[0].getBoundingClientRect();
        this.props.updateCellSizeDispatch(cell.width, cell.height);
    }

    isOccupied(start) {
        let startDay = this.indexOfDay(this.state.firstBlock.getAttribute("data-day"));
        let startIndex = this.indexOfTime(this.state.firstBlock.getAttribute("data-time"));
        for (let i=0, lecture; (lecture = this.props.currentTimetable.lectures[i]); i++) {
            for (let j=0, classtime; (classtime=lecture.classtimes[j]); j++){
                if (classtime.day === startDay){
                    let startTime = this.indexOfTime(classtime.begin);
                    if(startIndex <= startTime && startTime <= start){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    dragStart(e){
        if (this.state.isBubbling) {
            this.setState({
                isBubbling : false,
            });
        } else {
            e.stopPropagation();
            e.preventDefault();
            this.setState({ firstBlock : e.target,});
            this.props.setIsDraggingDispatch(true);
            document.getElementById("drag-cell").classList.remove("none");
        }
    }

    dragMove(e) {
        if (!this.props.isDragging) return;
        let startIndex = this.indexOfTime(this.state.firstBlock.getAttribute("data-time"));
        let endIndex = this.indexOfTime(e.target.getAttribute("data-time"));
        let incr = startIndex < endIndex ? 1 : -1;
        for (let i=startIndex+incr; i !== endIndex+incr; i+=incr) {
            if (this.isOccupied(i)) {
                this.props.setIsDraggingDispatch(false);
                return;
            }
        }
        const second = e.target;
        let left = this.state.firstBlock.offsetLeft - document.getElementById("timetable-wrap").offsetLeft - 1;
        let width = this.state.firstBlock.offsetWidth + 2;
        let top = Math.min(this.state.firstBlock.offsetTop, second.offsetTop) - document.getElementById("timetable-wrap").offsetTop + 2;
        let height = Math.abs(this.state.firstBlock.offsetTop - second.offsetTop) + this.state.firstBlock.offsetHeight -2;
        this.setState({
            secondBlock : second,
            height : height,
            width : width,
            left : left,
            top : top,
        });
    }

    dragEnd(e){
        if (this.props.isDragging) this.props.setIsDraggingDispatch(false);
        let startDay = this.indexOfDay(this.state.firstBlock.getAttribute("data-day"));
        let startIndex = this.indexOfTime(this.state.firstBlock.getAttribute("data-time"));
        let endIndex = this.indexOfTime(e.target.getAttribute("data-time"));
        if (startIndex === endIndex) return;

        this.props.dragSearchDispatch(startDay, startIndex, endIndex);
        document.getElementById("drag-cell").classList.add("none");
        this.setState({height : 0,});
    }

    indexOfDay(day) {
        var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        return days.indexOf(day);
    }

    indexOfTime(timeStr) {
        let time = parseInt(timeStr);
        let firstTime = 800;
        var hour;
        var min;
        if (time >= firstTime){
            time -= firstTime;
            hour = Math.floor(time / 100);
            min = time % 100;
        }else{
            hour = Math.floor(time / 60)-8;
            min = time % 60;
        }

        return hour*2 + min/30;
    }

    componentDidMount() {
        this.resize();
        window.addEventListener("resize", this.resize.bind(this));
    }

    componentDidUpdate() {
        this.resize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize.bind(this));
    }

    render() {
        let lectureBlocks = [];
        for (let i=0, lecture; (lecture = this.props.currentTimetable.lectures[i]); i++) {
            for (let j=0, classtime; (classtime=lecture.classtimes[j]); j++) {
                lectureBlocks.push(
                    <TimetableBlock
                        key={`${lecture.id}:${j}`}
                        // onMouseDown={this.clickBlock}
                        onMouseOver={this.blockHover}
                        onMouseOut={this.blockOut}
                        onClick={this.blockClick}
                        lecture={lecture}
                        classtime={classtime}
                    />
                );
            }
        }

        const dragDiv = (day, ko) => {
            let timeblock = [];
            timeblock.push(<div className="chead">{ko}</div>);
            for (let i=800 ; i<= 2350; i+=50 ) {
                if ( i === 1200 ) timeblock.push(<div className="cell-bold cell1 half table-drag" data-day={day} data-time='1200' onMouseDown={(e)=>this.dragStart(e)} onMouseMove={(e)=>this.dragMove(e)} onMouseUp={(e)=>this.dragEnd(e)} ></div>);
                else if ( i === 1800 ) timeblock.push(<div className="cell-bold cell1 half table-drag" data-day={day} data-time='1800' onMouseDown={(e)=>this.dragStart(e)} onMouseMove={(e)=>this.dragMove(e)} onMouseUp={(e)=>this.dragEnd(e)}></div>);
                else if ( i === 2350 ) timeblock.push(<div className="cell2 half cell-last table-drag" data-day={day} data-time='2330' onMouseDown={(e)=>this.dragStart(e)} onMouseMove={(e)=>this.dragMove(e)} onMouseUp={(e)=>this.dragEnd(e)}></div>);
                else if ( i%100 === 0 ) timeblock.push(<div className="cell1 half table-drag" data-day={day} data-time={i.toString()} onMouseDown={(e)=>this.dragStart(e)} onMouseMove={(e)=>this.dragMove(e)} onMouseUp={(e)=>this.dragEnd(e)}></div>);
                else{
                    timeblock.push(<div className="cell2 half table-drag" data-day={day} data-time={(i-20).toString()} onMouseDown={(e)=>this.dragStart(e)} onMouseMove={(e)=>this.dragMove(e)} onMouseUp={(e)=>this.dragEnd(e)}></div>);
                }
            };
            return timeblock;
        };

        return (
            <div id="timetable-wrap">
                <div id="timetable-contents">
                    <div id="rowheaders">
                        <div className="rhead rhead-chead"><span className="rheadtext">8</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">9</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">10</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">11</span></div>
                        <div className="rhead"></div>
                        <div className="rhead rhead-bold"><span className="rheadtext">12</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">1</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">2</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">3</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">4</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">5</span></div>
                        <div className="rhead"></div>
                        <div className="rhead rhead-bold"><span className="rheadtext">6</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">7</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">8</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">9</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">10</span></div>
                        <div className="rhead"></div>
                        <div className="rhead"><span className="rheadtext">11</span></div>
                        <div className="rhead"></div>
                        <div className="rhead rhead-bold rhead-last"><span className="rheadtext">12</span></div>
                    </div>
                    <div className="day">
                        {dragDiv('mon','월요일')}
                    </div>
                    <div className="day">
                        {dragDiv('tue','화요일')}
                    </div>
                    <div className="day">
                        {dragDiv('wed','수요일')}
                    </div>
                    <div className="day">
                        {dragDiv('thu','목요일')}
                    </div>
                    <div className="day">
                        {dragDiv('fri','금요일')}
                    </div>
                </div>
                <div id="drag-cell" className="none" style={{left:this.state.left, width:this.state.width, top:this.state.top, height:this.state.height}}>
                </div>
                {lectureBlocks}
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currentTimetable : state.timetable.currentTimetable,
        lectureActive: state.lectureActive,
        isDragging : state.timetable.isDragging,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        updateCellSizeDispatch : (width, height) => {
            dispatch(updateCellSize(width, height));
        },
        dragSearchDispatch : (day, start, end ) => {
            dispatch(dragSearch(day, start, end));
        },
        setIsDraggingDispatch : (isDragging) => {
            dispatch(setIsDragging(isDragging));
        }
    }
};

Timetable = connect(mapStateToProps, mapDispatchToProps)(Timetable);

export default Timetable;
