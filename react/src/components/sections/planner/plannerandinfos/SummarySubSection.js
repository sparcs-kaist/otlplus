import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import itemFocusShape from '../../../../shapes/state/planner/ItemFocusShape';

import CreditBar from '../../../CreditBar';
import CourseStatus from '../../../CourseStatus';
import Scroller from '../../../Scroller';
import { ItemFocusFrom } from '../../../../reducers/planner/itemFocus';
import {
  getCategoryOfItem, getCategoryOfType, getColorOfCategory,
  getCreditOfItem, getAuOfItem, getCreditAndAuOfItem, getSeparateMajorTracks,
} from '../../../../utils/itemUtils';
import plannerShape from '../../../../shapes/model/planner/PlannerShape';


const ValueIndex = {
  TAKEN: 0,
  PLANNED: 1,
  FOCUSED: 2,
  REQUIREMENT: 3,
};


class SummarySubSection extends Component {
  render() {
    const { t, itemFocus, selectedPlanner } = this.props;

    const separateMajorTracks = selectedPlanner
      ? getSeparateMajorTracks(selectedPlanner)
      : [];
    const advancedMajorTrack = selectedPlanner
      ? selectedPlanner.additional_tracks.find((at) => (at.type === 'ADVANCED'))
      : undefined;

    const totalCredit = [0, 0, 0, 136];
    const totalAu = [0, 0, 0, 8];
    // TODO: Apply constants to indexes
    // TODO: Load requirements from planner
    const categoryCreditAndAus = {
      // Basic
      0: [[[0, 0, 0, 23], [0, 0, 0, 9]]],
      // Major
      1: separateMajorTracks.map((smt) => [[0, 0, 0, 19], [0, 0, 0, 30]]),
      // Research
      2: [[[0, 0, 0, 3], [0, 0, 0, 0]]],
      // General and humanity
      3: [[[0, 0, 0, 15], [0, 0, 0, 21]]],
      // Others
      4: [[[0, 0, 0, 0], [0, 0, 0, 0]]],
    };

    const categoryBigTitles = {
      // Basic
      0: [t('ui.type.basic')],
      // Major
      1: separateMajorTracks.map((smt, index) => {
        if (index === 0) {
          const majorName = advancedMajorTrack ? t('ui.type.advancedMajor') : t('ui.type.major');
          return `${majorName} - ${smt.department[t('js.property.name')]}`;
        }
        if (smt.type === 'DOUBLE') {
          return `${t('ui.type.doubleMajor')} - ${smt.department[t('js.property.name')]}`;
        }
        if (smt.type === 'MINOR') {
          return `${t('ui.type.minor')} - ${smt.department[t('js.property.name')]}`;
        }
        if (smt.type === 'INTERDISCIPLINARY') {
          return `${t('ui.type.interdisciplinaryMajor')}`;
        }
        return 'Unknown';
      }),
      // Research
      2: [`${t('ui.type.research')}`],
      // General and humanity
      3: [t('ui.type.general')],
      // Others
      4: [t('ui.type.etc')],
    };
    const categoryTitles = {
      // Basic
      0: [[t('ui.type.basicRequired'), t('ui.type.basicElective')]],
      // Major
      1: separateMajorTracks.map((smt) => [t('ui.type.majorRequired'), t('ui.type.majorElective')]),
      // Research
      2: [[t('ui.type.thesisStudy'), t('ui.type.individualStudy')]],
      // General and humanity
      3: [[t('ui.type.generalRequired'), t('ui.type.humanities')]],
      // Others
      4: [[t('ui.type.otherElective'), t('ui.type.unclassified')]],
    };

    if (selectedPlanner?.general_track) {
      // TODO: support unsigned user
      const hasDoublemajor = selectedPlanner.additional_tracks.filter((at) => (at.type === 'DOUBLE')).length !== 0;
      /* eslint-disable fp/no-mutation */
      totalCredit[ValueIndex.REQUIREMENT] = selectedPlanner.general_track.total_credit;
      totalAu[ValueIndex.REQUIREMENT] = selectedPlanner.general_track.total_au;
      categoryCreditAndAus[0][0][0][ValueIndex.REQUIREMENT] = (
        selectedPlanner.general_track.basic_required
      );
      categoryCreditAndAus[0][0][1][ValueIndex.REQUIREMENT] = (
        hasDoublemajor
          ? selectedPlanner.major_track.basic_elective_doublemajor
          : selectedPlanner.general_track.basic_elective
      );
      categoryCreditAndAus[2][0][0][ValueIndex.REQUIREMENT] = (
        hasDoublemajor
          ? selectedPlanner.general_track.thesis_study_doublemajor
          : selectedPlanner.general_track.thesis_study
      );
      categoryCreditAndAus[3][0][0][ValueIndex.REQUIREMENT] = (
        selectedPlanner.general_track.general_required_credit
          + selectedPlanner.general_track.general_required_au
      );
      categoryCreditAndAus[3][0][1][ValueIndex.REQUIREMENT] = (
        hasDoublemajor
          ? selectedPlanner.general_track.humanities_doublemajor
          : selectedPlanner.general_track.humanities
      );
      /* eslint-enable fp/no-mutation */
    }

    separateMajorTracks.forEach((smt, index) => {
      /* eslint-disable fp/no-mutation */
      categoryCreditAndAus[1][index][0][ValueIndex.REQUIREMENT] = smt.major_required;
      categoryCreditAndAus[1][index][1][ValueIndex.REQUIREMENT] = smt.major_elective;
      /* eslint-enable fp/no-mutation */
    });
    if (advancedMajorTrack) {
      /* eslint-disable fp/no-mutation */
      categoryCreditAndAus[1][0][0][ValueIndex.REQUIREMENT] += advancedMajorTrack.major_required;
      categoryCreditAndAus[1][0][1][ValueIndex.REQUIREMENT] += advancedMajorTrack.major_elective;
      /* eslint-enable fp/no-mutation */
    }

    if (selectedPlanner) {
      /* eslint-disable fp/no-mutation */
      selectedPlanner.taken_items.filter((i) => !i.is_excluded).forEach((i) => {
        const category = getCategoryOfItem(selectedPlanner, i);
        totalCredit[ValueIndex.TAKEN] += getCreditOfItem(i);
        totalAu[ValueIndex.TAKEN] += getAuOfItem(i);
        categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.TAKEN] += getCreditAndAuOfItem(i);
      });
      selectedPlanner.future_items.filter((i) => !i.is_excluded).forEach((i) => {
        const category = getCategoryOfItem(selectedPlanner, i);
        totalCredit[ValueIndex.PLANNED] += getCreditOfItem(i);
        totalAu[ValueIndex.PLANNED] += getAuOfItem(i);
        categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.PLANNED] += getCreditAndAuOfItem(i);
      });
      selectedPlanner.arbitrary_items.filter((i) => !i.is_excluded).forEach((i) => {
        const category = getCategoryOfItem(selectedPlanner, i);
        totalCredit[ValueIndex.PLANNED] += getCreditOfItem(i);
        totalAu[ValueIndex.PLANNED] += getAuOfItem(i);
        categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.PLANNED] += getCreditAndAuOfItem(i);
      });
      /* eslint-enable fp/no-mutation */
    }

    if (itemFocus.from === ItemFocusFrom.LIST) {
      /* eslint-disable fp/no-mutation */
      const category = getCategoryOfType(selectedPlanner, itemFocus.course.type_en, itemFocus.course.department?.code);
      totalCredit[ValueIndex.FOCUSED] += itemFocus.course.credit;
      totalAu[ValueIndex.FOCUSED] += itemFocus.course.credit_au;
      categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.FOCUSED] += itemFocus.course.credit + itemFocus.course.credit_au;
      /* eslint-enable fp/no-mutation */
    }
    else if (
      (itemFocus.from === ItemFocusFrom.TABLE_TAKEN
      || itemFocus.from === ItemFocusFrom.TABLE_FUTURE
      || itemFocus.from === ItemFocusFrom.TABLE_ARBITRARY)
      && !itemFocus.item.is_excluded
    ) {
      /* eslint-disable fp/no-mutation */
      const category = getCategoryOfItem(selectedPlanner, itemFocus.item);
      totalCredit[ValueIndex.FOCUSED] += getCreditOfItem(itemFocus.item);
      totalAu[ValueIndex.FOCUSED] += getAuOfItem(itemFocus.item);
      categoryCreditAndAus[category[0]][category[1]][category[2]][ValueIndex.FOCUSED] += getCreditAndAuOfItem(itemFocus.item);
      /* eslint-enable fp/no-mutation */
    }

    return (
      <>
        <div className={classNames('subsection', 'subsection--planner-summary', 'mobile-hidden')}>
          <Scroller expandTop={12}>
            <CourseStatus
              entries={[
                {
                  name: t('ui.type.total'),
                  info: [
                    {
                      name: t('ui.type.totalCredit'),
                      controller: (
                        <CreditBar
                          takenCredit={totalCredit[ValueIndex.TAKEN]}
                          plannedCredit={totalCredit[ValueIndex.PLANNED]}
                          focusedCredit={totalCredit[ValueIndex.FOCUSED]}
                          totalCredit={totalCredit[ValueIndex.REQUIREMENT]}
                          colorIndex={17}
                          focusFrom={itemFocus.from}
                        />
                      ),
                    },
                    {
                      name: t('ui.type.totalAu'),
                      controller: (
                        <CreditBar
                          takenCredit={totalAu[ValueIndex.TAKEN]}
                          plannedCredit={totalAu[ValueIndex.PLANNED]}
                          focusedCredit={totalAu[ValueIndex.FOCUSED]}
                          totalCredit={totalAu[ValueIndex.REQUIREMENT]}
                          colorIndex={17}
                          focusFrom={itemFocus.from}
                        />
                      ),
                    },
                  ],
                },
                ...range(0, 5).map((i) => (
                  range(0, categoryCreditAndAus[i].length).map((j) => ({
                    name: categoryBigTitles[i][j],
                    info: range(0, categoryCreditAndAus[i][j].length).map((k) => (
                      {
                        name: categoryTitles[i][j][k],
                        controller: (
                          <CreditBar
                            takenCredit={categoryCreditAndAus[i][j][k][ValueIndex.TAKEN]}
                            plannedCredit={categoryCreditAndAus[i][j][k][ValueIndex.PLANNED]}
                            focusedCredit={categoryCreditAndAus[i][j][k][ValueIndex.FOCUSED]}
                            totalCredit={categoryCreditAndAus[i][j][k][ValueIndex.REQUIREMENT]}
                            colorIndex={getColorOfCategory(selectedPlanner, [i, j, k])}
                            focusFrom={itemFocus.from}
                          />
                        ),
                      }
                    )),
                  }))
                )).flat(),
              ]}
            />
          </Scroller>


        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedPlanner: state.planner.planner.selectedPlanner,
  itemFocus: state.planner.itemFocus,
});

const mapDispatchToProps = (dispatch) => ({
});

SummarySubSection.propTypes = {
  selectedPlanner: plannerShape,
  itemFocus: itemFocusShape.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    SummarySubSection
  )
);
