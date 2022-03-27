import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import qs from 'qs';
import Scroller from '../../Scroller';
import CloseButton from '../../CloseButton';
import Divider from '../../Divider';

import { clearCourseFocus, setLectures, setReviews } from '../../../actions/dictionary/courseFocus';
import { addCourseRead } from '../../../actions/dictionary/list';

import courseFocusShape from '../../../shapes/state/CourseFocusShape';
import userShape from '../../../shapes/model/UserShape';
import Attributes from '../../Attributes';
import SearchFilter from '../../SearchFilter';
import {
    getSemesterOptions, getRetakeOptions, getTypeOptions, getDepartmentOptions, getLevelOptions, getTermOptions,
  } from '../../../common/seachOptions';
import Setting from '../../Setting';
import Controller from '../../Controller';

class CourseSettingSubSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSemester: new Set(['ALL']),
            selectedRetake: new Set(['ALL']),
            basicRequired: 0,
            basicElective: 0,
            majorRequired: 0,
            majorElective: 0,
            secondMajorRequired: 0,
            secondMajorElective: 0,
            totalCredit: 0
        };
      }
    
      updateCheckedValues = (filterName) => (checkedValues) => {
        this.setState({
          [filterName]: checkedValues,
        });
      }

      updateCredits = (optionName) => (creditValues) => {
          this.setState({
              [optionName]: creditValues,
          });
      }

      initialize = () => {
        this.setState({
            selectedSemester: new Set(['ALL']),
            selectedRetake: new Set(['ALL']),
            basicRequired: 0,
            basicElective: 0,
            majorRequired: 0,
            majorElective: 0,
            secondMajorRequired: 0,
            secondMajorElective: 0,
            totalCredit: 0
        });
      }

    render() {
        const { t } = this.props;
        const {
            selectedSemester, selectedRetake, totalCredit, basicRequired, basicElective, majorRequired, majorElective, secondMajorRequired, secondMajorElective
          } = this.state;
        const sectionHead = (
            <>
                <div className={classNames('detail-title-area')}>
                    <div className={classNames('title')}>{t('ui.title.lectureInformation')}</div> 
                    <div className={classNames('subtitle')}>수강 완료 - 2016 봄</div>
                    <button type="reset" className={classNames('text-button', 'text-button--right')} onClick={this.initialize}>{t('ui.button.reset')}</button>
                </div>
            </>
        );
        const sectionBody = (
            <> 
                <Scroller>
                    <SearchFilter
                        updateCheckedValues={this.updateCheckedValues('selectedSemester')}
                        inputName="semester"
                        titleName={t('ui.search.semester')}
                        options={getSemesterOptions()}
                        checkedValues={selectedSemester}
                    />    
                    <SearchFilter
                        updateCheckedValues={this.updateCheckedValues('selectedRetake')}
                        inputName="retake"
                        titleName={t('ui.search.retake')}
                        options={getRetakeOptions()}
                        checkedValues={selectedRetake}
                    /> 
                    <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
                    <Setting 
                        entries={[
                            {name: '전체', info: [{name: '총학점', controller: <Controller count={totalCredit} updateFunct={this.updateCredits('totalCredit')}/>}]},
                            {name: '기초', info: [{name: '기초필수', controller: <Controller count={basicRequired} updateFunct={this.updateCredits('basicRequired')}/>}, {name: '기초선택', controller: <Controller count={basicElective} updateFunct={this.updateCredits('basicElective')}/>}]},
                            {name: '전공', info: [{name: '전공필수', controller: <Controller count={majorRequired} updateFunct={this.updateCredits('majorRequired')}/>}, {name: '전공선택', controller: <Controller count={majorElective} updateFunct={this.updateCredits('majorElective')}/>}]},
                            {name: '복수전공', info: [{name: '전공필수', controller: <Controller count={secondMajorRequired} updateFunct={this.updateCredits('secondMajorRequired')}/>}, {name: '전공선택', controller: <Controller count={secondMajorElective} updateFunct={this.updateCredits('secondMajorElective')}/>}]},
                        ]}
                    />
                </Scroller>
            </>
            
        );

        return(
            <div className={classNames('subsection', 'subsection--course-info-setting')}>
                {sectionHead}
                {sectionBody}
            </div>
        );
    }
}

export default withTranslation()(
    CourseSettingSubSection
);