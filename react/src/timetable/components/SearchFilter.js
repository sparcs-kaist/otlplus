import React, { Component } from 'react';
import SearchCircle from './SearchCircle'

class SearchFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            allChecked:true,
            checkNum:1,
        };
    }

    clickCircle(value,isChecked){
        let filter = {
            name:this.props.inputName,
            value:value,
            isChecked:isChecked
        }
        this.props.clickCircle(filter);
        if(value==="ALL" && isChecked){
            this.setState({
                allChecked: true,
            });//It is alreat send to Search
        }else if(isChecked){
            //Check without all button, checkout all button
            if(this.state.allChecked){
                this.setState({
                    allChecked:false,
                    checkNum:1,
                });
                filter['value'] = 'ALL';
                filter['isChecked'] = false;
                this.props.clickCircle(filter);
            }else{
                this.setState(({checkNum})=>{
                    return {
                        checkNum:checkNum+1,
                    }
                });
            }
        }else {//When Check out somtething
            if(this.state.checkNum === 1) {
                this.setState({
                    allChecked: true,
                });//All circle check out so have to check all
                filter['value'] = 'ALL';
                filter['isChecked'] = true;
                this.props.clickCircle(filter);
            }else{
                this.setState(( { checkNum } ) => {
                    return { checkNum: checkNum-1,}
                })
                //All circle check out so have to check all
            }
        }
    }


    render() {
        const { inputName, titleName } = this.props;
        let valueArr;
        let nameArr;
        switch (inputName){
            case 'type':
                valueArr = ['ALL','GR'];
                nameArr = ['전체','공통'];
                break;
            case 'department':
                valueArr = ['ALL','CS',"ME"];
                nameArr = ['전체','전산',"기계"];
                break;
            default:
                valueArr = ['ALL'];
                nameArr = ['전체'];
        }
        const mapCircle = (value,index) => {
            return (
                <SearchCircle
                    key={index}
                    value={value}
                    inputName={inputName}
                    circleName = {nameArr[index]}
                    clickCircle = {this.clickCircle.bind(this)}
                    allChecked = {this.state.allChecked}/>
            )
        };

        return (
            <div className="search-filter">
                <label
                    className="search-filter-title fixed-ko">{ titleName }</label>
                <div className="search-filter-elem">
                    {valueArr.map(mapCircle)}
                </div>
            </div>);
    }

}

export default SearchFilter;
