import React, { Component } from 'react';
import {connect} from "react-redux";
import TimetableBlock from "./TimetableBlock";
import {updateCellSize} from "../actions";

class Timetable extends Component {
    resize() {
        let cell = document.getElementsByClassName("cell1")[0].getBoundingClientRect();
        this.props.updateCellSizeDispatch(cell.width, cell.height);
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
        for (let i=0, lecture; lecture = this.props.currentTimetable.lectures[i]; i++) {
            for (let j=0, classtime; classtime=lecture.classtimes[j]; j++) {
                lectureBlocks.push(
                    <TimetableBlock key={`${lecture.id}:${j}`} lecture={lecture} classtime={classtime} isTemp={false}/>
                );
            }
        }

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
                        <div className="chead">월요일</div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='800'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='830'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='900'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='930'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='1000'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1030'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='1100'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1130'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='mon' data-time='1200'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1230'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='1300'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1330'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='1400'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1430'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='1500'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1530'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='1600'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1630'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='1700'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1730'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='mon' data-time='1800'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1830'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='1900'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='1930'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='2000'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='2030'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='2100'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='2130'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='2200'></div>
                        <div className="cell2 half table-drag" data-day='mon' data-time='2230'></div>
                        <div className="cell1 half table-drag" data-day='mon' data-time='2300'></div>
                        <div className="cell2 half cell-last table-drag" data-day='mon' data-time='2330'></div>
                    </div>
                    <div className="day">
                        <div className="chead">화요일</div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='800'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='830'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='900'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='930'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='1000'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1030'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='1100'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1130'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='tue' data-time='1200'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1230'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='1300'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1330'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='1400'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1430'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='1500'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1530'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='1600'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1630'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='1700'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1730'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='tue' data-time='1800'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1830'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='1900'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='1930'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='2000'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='2030'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='2100'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='2130'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='2200'></div>
                        <div className="cell2 half table-drag" data-day='tue' data-time='2230'></div>
                        <div className="cell1 half table-drag" data-day='tue' data-time='2300'></div>
                        <div className="cell2 half cell-last table-drag" data-day='tue' data-time='2330'></div>
                    </div>
                    <div className="day">
                        <div className="chead">수요일</div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='800'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='830'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='900'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='930'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='1000'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1030'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='1100'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1130'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='wed' data-time='1200'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1230'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='1300'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1330'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='1400'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1430'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='1500'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1530'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='1600'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1630'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='1700'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1730'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='wed' data-time='1800'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1830'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='1900'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='1930'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='2000'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='2030'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='2100'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='2130'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='2200'></div>
                        <div className="cell2 half table-drag" data-day='wed' data-time='2230'></div>
                        <div className="cell1 half table-drag" data-day='wed' data-time='2300'></div>
                        <div className="cell2 half cell-last table-drag" data-day='wed' data-time='2330'></div>
                    </div>
                    <div className="day">
                        <div className="chead">목요일</div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='800'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='830'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='900'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='930'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='1000'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1030'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='1100'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1130'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='thu' data-time='1200'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1230'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='1300'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1330'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='1400'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1430'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='1500'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1530'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='1600'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1630'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='1700'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1730'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='thu' data-time='1800'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1830'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='1900'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='1930'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='2000'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='2030'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='2100'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='2130'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='2200'></div>
                        <div className="cell2 half table-drag" data-day='thu' data-time='2230'></div>
                        <div className="cell1 half table-drag" data-day='thu' data-time='2300'></div>
                        <div className="cell2 half cell-last table-drag" data-day='thu' data-time='2330'></div>
                    </div>
                    <div className="day">
                        <div className="chead">금요일</div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='800'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='830'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='900'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='930'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='1000'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1030'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='1100'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1130'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='fri' data-time='1200'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1230'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='1300'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1330'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='1400'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1430'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='1500'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1530'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='1600'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1630'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='1700'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1730'></div>
                        <div className="cell-bold cell1 half table-drag" data-day='fri' data-time='1800'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1830'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='1900'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='1930'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='2000'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='2030'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='2100'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='2130'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='2200'></div>
                        <div className="cell2 half table-drag" data-day='fri' data-time='2230'></div>
                        <div className="cell1 half table-drag" data-day='fri' data-time='2300'></div>
                        <div className="cell2 half cell-last table-drag" data-day='fri' data-time='2330'></div>
                    </div>
                </div>
                <div id="drag-cell" className="none">
                </div>
                {lectureBlocks}
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
        updateCellSizeDispatch : (width, height) => {
            dispatch(updateCellSize(width, height));
        },
    }
};

Timetable = connect(mapStateToProps, mapDispatchToProps)(Timetable);

export default Timetable;
