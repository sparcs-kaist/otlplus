import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axios from 'axios';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Footer from '../common/guideline/components/Footer';
import TodaysTimetableSection from '../components/sections/main/TodaysTimetableSection';
import AcademicScheduleSection from '../components/sections/main/AcademicScheduleSection';
import RelatedCourseFeedSection from '../components/sections/main/RelatedCourseFeedSection';
import LatestReviewSection from '../components/sections/main/LatestReviewSection';
import FamousMajorReviewFeedSection from '../components/sections/main/FamousMajorReviewFeedSection';
import FamousHumanityReviewFeedSection from '../components/sections/main/FamousHumanityReviewFeedSection';
import RankedReviewFeedSection from '../components/sections/main/RankedReviewFeedSection';
import ReviewWriteFeedSection from '../components/sections/main/ReviewWriteFeedSection';
import MainSearchSection from '../components/sections/main/MainSearchSection';
import userShape from '../shapes/model/session/UserShape';
import NoticeSection from '../components/sections/main/NoticeSection';
import RateFeedSection from '../components/sections/main/RateFeedSection ';


class MainPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      feedDays: [],
      notices: null,
      isLoading: false,
    };

    // eslint-disable-next-line fp/no-mutation
    this.contentRef = React.createRef();
  }


  componentDidMount() {
    const { user } = this.props;

    window.addEventListener('scroll', this.handleScroll);

    const today = new Date();
    if (user) {
      this._fetchFeeds(today);
    }
    this._fetchNotices();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user } = this.props;

    const today = new Date();
    if (user && !prevProps.user) {
      this._fetchFeeds(today);
    }
  }


  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }


  handleScroll = (e) => {
    this._checkAndLoadFeeds();
  }


  _checkAndLoadFeeds = () => {
    const { isLoading } = this.state;
    const { user } = this.props;
    const SCROLL_BOTTOM_PADDING = 100;

    if (isLoading) {
      return;
    }
    if (!user) {
      return;
    }

    const columns = Array.from(this.contentRef.current.querySelectorAll(`.${classNames('page-grid--main')} > div`));

    const isBottomReached = columns.some((cl) => (
      cl.lastChild.getBoundingClientRect().top < window.innerHeight + SCROLL_BOTTOM_PADDING
    ));
    if (isBottomReached) {
      this._fetchFeeds(this._getPrevDate());
    }
  }


  _getPrevDate = () => {
    const { feedDays } = this.state;
    const targetDate = new Date(feedDays[feedDays.length - 1].date);
    targetDate.setDate(targetDate.getDate() - 1);
    return targetDate;
  }


  _fetchFeeds = (date) => {
    const { feedDays, isLoading } = this.state;
    const { user } = this.props;

    if (isLoading) {
      return;
    }
    if (!user) {
      return;
    }
    if (this._getDateDifference(date) >= 14) {
      return;
    }

    this.setState({
      isLoading: true,
    });

    const dateString = date.toJSON().slice(0, 10);

    axios.get(
      `/api/users/${user.id}/feeds`,
      {
        params: {
          date: dateString,
        },
        metadata: {
          gaCategory: 'Feed',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        this.setState({
          isLoading: false,
          feedDays: [
            ...feedDays,
            {
              date: dateString,
              feeds: response.data,
            },
          ],
        });
        this._checkAndLoadFeeds();
      })
      .catch((error) => {
      });
  }

  _fetchNotices = () => {
    const now = new Date();
    axios.get(
      '/api/notices',
      {
        params: {
          time: now.toJSON(),
          order: ['start_time', 'id'],
        },
        metadata: {
          gaCategory: 'Notice',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        this.setState({
          notices: response.data,
        });
      })
      .catch((error) => {
      });
  }

  _getDateDifference = (date) => {
    const copiedDate = new Date(date);
    const todayDate = new Date();
    copiedDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);
    const timeDiff = todayDate - copiedDate;
    return timeDiff / (24 * 60 * 60 * 1000);
  }


  render() {
    const { t } = this.props;
    const { feedDays, notices } = this.state;
    const { user, isPortrait } = this.props;

    const mapFeedToSection = (feed, date) => {
      if (feed.type === 'REVIEW_WRITE') {
        return (
          <ReviewWriteFeedSection
            lecture={feed.lecture}
            review={user.reviews.find((r) => (r.lecture.id === feed.lecture.id))}
            key={`${date.date}-${feed.type}-${feed.lecture.id}`}
          />
        );
      }
      if (feed.type === 'RELATED_COURSE') {
        return (
          <RelatedCourseFeedSection
            course={feed.course}
            key={`${date.date}-${feed.type}-${feed.course.id}`}
          />
        );
      }
      if (feed.type === 'FAMOUS_MAJOR_REVIEW') {
        return (
          <FamousMajorReviewFeedSection
            department={feed.department}
            reviews={feed.reviews}
            key={`${date.date}-${feed.type}-${feed.department.code}`}
          />
        );
      }
      if (feed.type === 'FAMOUS_HUMANITY_REVIEW') {
        return (
          <FamousHumanityReviewFeedSection
            reviews={feed.reviews}
            key={`${date.date}-${feed.type}`}
          />
        );
      }
      if (feed.type === 'RANKED_REVIEW') {
        return (
          <RankedReviewFeedSection
            semester={feed.semester}
            reviews={feed.reviews}
            key={`${date.date}-${feed.type}`}
          />
        );
      }
      if (feed.type === 'RATE') {
        return (
          <RateFeedSection
            rated={feed.rated}
            key={`${date.date}-${feed.type}`}
          />
        );
      }
      return null;
    };

    const columnNum = isPortrait ? 1 : 3;

    const feeds = [
      <TodaysTimetableSection key="TODAYS_TIMETABLE" />,
      <AcademicScheduleSection key="ACADEMIC_SCHEDULE" />,
      notices
        ? (
          notices.map((n) => (
            <NoticeSection notice={n} key={`${n.start_date}-${n.end_date}-${n.title}`} />
          ))
        )
        : [],
      <LatestReviewSection key="LATEST_REVIEW" />,
      !user
        ? []
        : feedDays.map((d) => d.feeds.map((f) => mapFeedToSection(f, d))),
    ].flat(3);

    return (
      <>
        <section className={classNames('main-image')}>
          <MainSearchSection />
        </section>
        <section className={classNames('content')} ref={this.contentRef}>
          <div className={classNames('page-grid', 'page-grid--main')}>
            {
              range(columnNum).map((i) => (
                <div
                  style={{
                    gridArea: `feeds-column-${i + 1}`,
                    position: 'relative',
                    overflow: 'initial',
                    minWidth: 0,
                  }}
                  key={i}
                >
                  { feeds.filter((v, i2) => (i2 % columnNum === i)) }
                  <div style={{ position: 'absolute', width: '100%' }}>
                    {
                      range(10).map((j) => (
                        <div className={classNames('section', 'section--feed--placeholder')} key={j} />
                      ))
                    }
                  </div>
                </div>
              ))
            }
            <div className={classNames('main-date')}>
              {
                user
                  ? (
                    <span onClick={() => this._fetchFeeds(this._getPrevDate())}>
                      {t('ui.button.loadMore')}
                    </span>
                  )
                  : (
                    <>
                      <a href={`/session/login/?next=${window.location.href}`}>
                        {t('ui.button.signInWithSso')}
                      </a>
                      <div>
                        {t('ui.message.signInForMore')}
                      </div>
                    </>
                  )
              }
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  isPortrait: state.common.media.isPortrait,
});

const mapDispatchToProps = (dispatch) => ({
});

MainPage.propTypes = {
  user: userShape,
  isPortrait: PropTypes.bool.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    MainPage
  )
);
