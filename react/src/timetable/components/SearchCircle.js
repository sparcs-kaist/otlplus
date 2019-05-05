import React, { Component } from 'react';

class SearchCircle extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isChecked:this.props.value === 'ALL',
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        //Return value will be set the state
        if(nextProps.value === 'ALL'){
            if(nextProps.allChecked){
                return {isChecked:true};
            }else{
                return {isChecked:false};
            }
        }
        else{
            if(nextProps.allChecked){
                return {isChecked:false};
            }
            return null;
        }
    }

    onClick(e) {
        const value = e.target.value;
        if(this.state.isChecked && value ==="ALL") return; //Nothing do, return
        this.props.clickCircle(value,!this.state.isChecked);
        this.setState((prevState)=>{
            return {
                isChecked:!prevState.isChecked
            }
        });
    }


    render() {
        const { value , inputName, circleName } = this.props;
        const { isChecked } =this.state;
        const all = (value === 'ALL');
        const circleIcon = isChecked ?
            (<i className="fa fa-check-circle-o fa-ix"/>) :
            (<i className="fa fa-circle-o fa-1x"/>);
        return (
        <label>
            <input className={all ? 'chkall':'chkelem'} type="checkbox" autoComplete="off" name={inputName}
               value={value} onClick={(e)=>this.onClick(e)}/>
            {circleName}
            {circleIcon}
        </label>);
    }
}


export default SearchCircle;
