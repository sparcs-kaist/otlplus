import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Divider from '../../../Divider';
import Scroller from '../../../Scroller';
import CloseButton from '../../../CloseButton';
import OtlplusPlaceholder from '../../../OtlplusPlaceholder';
import CourseCustomizeSubSection from './CourseCustomizeSubSection';
import CourseInfoSubSection from './CourseInfoSubSection';
import CourseReviewsSubSection from './CourseReviewsSubSection';

import { clearItemFocus, setLectures, setReviews } from '../../../../actions/planner/itemFocus';

import itemFocusShape from '../../../../shapes/state/planner/ItemFocusShape';
import { ItemFocusFrom } from '../../../../reducers/planner/itemFocus';
import CourseAddSubSection from './CourseAddSubSection';
import plannerShape from '../../../../shapes/model/planner/PlannerShape';


class CourseManageSection extends Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line fp/no-mutation
    this.scoresRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const {
      selectedListCode, selectedPlanner, itemFocus,
      clearItemFocusDispatch,
    } = this.props;

    if (itemFocus.from === ItemFocusFrom.LIST
      && prevProps.selectedListCode !== selectedListCode) {
      clearItemFocusDispatch();
    }
    if ((
      itemFocus.from === ItemFocusFrom.TABLE_TAKEN
        || itemFocus.from === ItemFocusFrom.TABLE_FUTURE
        || itemFocus.from === ItemFocusFrom.TABLE_ARBITRARY
    )
      && prevProps.selectedPlanner.id !== selectedPlanner.id) {
      clearItemFocusDispatch();
    }

    if (!prevProps.itemFocus.clicked && itemFocus.clicked) {
      this._fetchLectures();
      this._fetchReviews();
    }
    if (prevProps.itemFocus.clicked && itemFocus.clicked
      && (prevProps.itemFocus.course?.id !== itemFocus.course?.id)) {
      this._fetchLectures();
      this._fetchReviews();
    }
  }


  _fetchLectures = () => {
    const { itemFocus, setLecturesDispatch } = this.props;

    if (itemFocus.course.isArbitrary) {
      return;
    }

    axios.get(
      `/api/courses/${itemFocus.course.id}/lectures`,
      {
        params: {
          order: ['year', 'semester', 'class_no'],
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET Lectures / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.itemFocus.course.id === itemFocus.course.id) {
          setLecturesDispatch(response.data);
        }
      })
      .catch((error) => {
      });
  }


  _fetchReviews = () => {
    const LIMIT = 100;

    const { itemFocus, setReviewsDispatch } = this.props;

    if (itemFocus.course.isArbitrary) {
      return;
    }

    axios.get(
      `/api/courses/${itemFocus.course.id}/reviews`,
      {
        params: {
          order: ['-lecture__year', '-lecture__semester', '-written_datetime', '-id'],
          limit: LIMIT,
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET Reviews / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.itemFocus.course.id !== itemFocus.course.id) {
          return;
        }
        if (response.data.length === LIMIT) {
          // TODO: handle limit overflow
        }
        setReviewsDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  unfix = () => {
    const { clearItemFocusDispatch } = this.props;
    clearItemFocusDispatch();
  }


  render() {
    const { t, itemFocus } = this.props;

    const sectionContent = itemFocus.course
      ? (
        <>
          <div className={classNames('subsection', 'subsection--course-manage-left')}>
            <div className={classNames('subsection', 'subsection--flex')}>
              <CloseButton onClick={this.unfix} />
              <div className={classNames('detail-title-area')}>
                <div className={classNames('title')}>
                  {itemFocus.course[t('js.property.title')]}
                </div>
                <div className={classNames('subtitle')}>
                  {itemFocus.course.old_code}
                </div>
                <div className={classNames('buttons')}>
                  <Link
                    className={classNames(
                      'text-button',
                      'text-button--right',
                      itemFocus.course.isArbitrary ? 'text-button--disabled' : ''
                    )}
                    to={{
                      pathname: '/dictionary',
                      search: qs.stringify({ startCourseId: itemFocus.course.id }),
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('ui.button.dictionary')}
                  </Link>
                </div>
              </div>
              {
                !itemFocus.course.isArbitrary && (
                  <Scroller key={itemFocus.course.id}>
                    <CourseInfoSubSection />
                    <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
                    <CourseReviewsSubSection />
                  </Scroller>
                )
              }
            </div>
          </div>
          <Divider
            orientation={{
              desktop: Divider.Orientation.VERTICAL,
              mobile: Divider.Orientation.HORIZONTAL,
            }}
            isVisible={true}
            gridArea="divider-main"
          />
          {
            itemFocus.from === ItemFocusFrom.LIST
              ? <CourseAddSubSection />
              : <CourseCustomizeSubSection key={`${itemFocus.item.item_type}:${itemFocus.item.id}`} />
          }
        </>
      )
      : (
        <OtlplusPlaceholder />
      );
    return (
      <div className={classNames('section', 'section--course-manage', 'mobile-hidden')}>
        {sectionContent}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  itemFocus: state.planner.itemFocus,
  selectedListCode: state.planner.list.selectedListCode,
  selectedPlanner: state.planner.planner.selectedPlanner,
});

const mapDispatchToProps = (dispatch) => ({
  clearItemFocusDispatch: () => {
    dispatch(clearItemFocus());
  },
  setLecturesDispatch: (lectures) => {
    dispatch(setLectures(lectures));
  },
  setReviewsDispatch: (reviews) => {
    dispatch(setReviews(reviews));
  },
});

CourseManageSection.propTypes = {
  itemFocus: itemFocusShape.isRequired,
  selectedListCode: PropTypes.string.isRequired,
  selectedPlanner: plannerShape,

  clearItemFocusDispatch: PropTypes.func.isRequired,
  setLecturesDispatch: PropTypes.func.isRequired,
  setReviewsDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseManageSection
  )
);
