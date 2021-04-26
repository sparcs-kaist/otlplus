import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Footer from '../components/guideline/Footer';
import TodaysTimetableSection from '../components/sections/main/TodaysTimetableSection';
import AcademicScheduleSection from '../components/sections/main/AcademicScheduleSection';
import VisitorSection from '../components/sections/main/VisitorSection';
import RelatedCourseFeedSection from '../components/sections/main/RelatedCourseFeedSection';
import LatestReviewSection from '../components/sections/main/LatestReviewSection';
import FamousMajorReviewFeedSection from '../components/sections/main/FamousMajorReviewFeedSection';
import FamousHumanityReviewFeedSection from '../components/sections/main/FamousHumanityReviewFeedSection';
import ReviewWriteFeedSection from '../components/sections/main/ReviewWriteFeedSection';
import MainSearchSection from '../components/sections/main/MainSearchSection';
import userShape from '../shapes/UserShape';
import NoticeSection from '../components/sections/main/NoticeSection';
import RateFeedSection from '../components/sections/main/RateFeedSection ';


class MainPage extends Component {
  portraitMediaQuery = window.matchMedia('(max-aspect-ratio: 4/3)')


  constructor(props) {
    super(props);

    this.state = {
      feedDays: [],
      notices: null,
      isLoading: false,
      isPortrait: this.portraitMediaQuery.matches,
    };

    // eslint-disable-next-line fp/no-mutation
    this.contentRef = React.createRef();
  }


  componentDidMount() {
    const { user } = this.props;

    window.addEventListener('scroll', this.handleScroll);
    this.portraitMediaQuery.addEventListener('change', this.handleAspectChange);

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
    this.portraitMediaQuery.removeEventListener('change', this.handleAspectChange);
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

    const columns = Array.from(this.contentRef.current.querySelectorAll(`.${classNames('section-wrap--main-column')}`));

    if (columns.some((cl) => (cl.lastChild.getBoundingClientRect().bottom < window.innerHeight + SCROLL_BOTTOM_PADDING))) {
      this._fetchFeeds(this._getPrevDate());
    }
  }


  handleAspectChange = (e) => {
    this.setState({
      isPortrait: e.matches,
    });
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
    const { feedDays, notices, isPortrait } = this.state;
    const { user } = this.props;

    const getDateName = (dateString) => {
      const date = new Date(dateString);
      const dateDiff = this._getDateDifference(date);
      if (dateDiff === 0) {
        return t('ui.others.today');
      }
      if (dateDiff === 1) {
        return t('ui.others.yesterday');
      }
      return t('ui.others.day', { date: date });
    };

    const mapFeedToSection = (feed, date) => {
      if (feed.type === 'REVIEW_WRITE') {
        return (
          <div className={classNames('section-wrap', 'section-wrap--feed')} key={`${date.date}-${feed.type}-${feed.lecture.id}`}>
            <div className={classNames('section')}>
              <ReviewWriteFeedSection
                lecture={feed.lecture}
                review={user.reviews.find((r) => (r.lecture.id === feed.lecture.id))}
              />
            </div>
          </div>
        );
      }
      if (feed.type === 'RELATED_COURSE') {
        return (
          <div className={classNames('section-wrap', 'section-wrap--feed')} key={`${date.date}-${feed.type}-${feed.course.id}`}>
            <div className={classNames('section')}>
              <RelatedCourseFeedSection course={feed.course} />
            </div>
          </div>
        );
      }
      if (feed.type === 'FAMOUS_MAJOR_REVIEW') {
        return (
          <div className={classNames('section-wrap', 'section-wrap--feed')} key={`${date.date}-${feed.type}-${feed.department.code}`}>
            <div className={classNames('section')}>
              <FamousMajorReviewFeedSection
                department={feed.department}
                reviews={feed.reviews}
              />
            </div>
          </div>
        );
      }
      if (feed.type === 'FAMOUS_HUMANITY_REVIEW') {
        return (
          <div className={classNames('section-wrap', 'section-wrap--feed')} key={`${date.date}-${feed.type}`}>
            <div className={classNames('section')}>
              <FamousHumanityReviewFeedSection reviews={feed.reviews} />
            </div>
          </div>
        );
      }
      if (feed.type === 'RATE') {
        return (
          <div className={classNames('section-wrap', 'section-wrap--feed')} key={`${date.date}-${feed.type}`}>
            <div className={classNames('section')}>
              <RateFeedSection rated={feed.rated} />
            </div>
          </div>
        );
      }
      return null;
    };

    const columnNum = isPortrait ? 1 : 3;

    const feeds = [
      <div className={classNames('section-wrap', 'section-wrap--feed')} key="TODAYS_TIMETABLE">
        <div className={classNames('section')}>
          <TodaysTimetableSection />
        </div>
      </div>,
      <div className={classNames('section-wrap', 'section-wrap--feed')} key="ACADEMIC_SCHEDULE">
        <div className={classNames('section')}>
          <AcademicScheduleSection />
        </div>
      </div>,
      notices
        ? (
          notices.map((n) => (
            <div className={classNames('section-wrap', 'section-wrap--feed')} key={`${n.start_date}-${n.end_date}-${n.title}`}>
              <div className={classNames('section')}>
                <NoticeSection notice={n} />
              </div>
            </div>
          ))
        )
        : [],
      <div className={classNames('section-wrap', 'section-wrap--feed')} key="LATEST_REVIEW">
        <div className={classNames('section')}>
          <LatestReviewSection />
        </div>
      </div>,
      !user
        ? [
          <div className={classNames('section-wrap', 'section-wrap--feed')} key="VISITOR">
            <div className={classNames('section')}>
              <VisitorSection />
            </div>
          </div>,
        ]
        : feedDays.map((d) => d.feeds.map((f) => mapFeedToSection(f, d))),
    ].flat(3);

    return (
      <>
        <section className={classNames('main-image')}>

          <div className={classNames('section-wrap', 'section-wrap--main-search')}>
            <div className={classNames('section')}>
              <MainSearchSection />
            </div>
          </div>
        </section>
        <section className={classNames('content', 'content--main')} ref={this.contentRef}>
          <div className={classNames('section-wrap', 'section-wrap--main-column-wrap')}>
            {
              [...Array(columnNum).keys()].map((i) => (
                <div className={classNames('section-wrap', 'section-wrap--main-column')} key={i}>
                  { feeds.filter((v, i2) => (i2 % columnNum === i)) }
                </div>
              ))
            }
          </div>
        </section>
        <Footer />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
});

MainPage.propTypes = {
  user: userShape,
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(MainPage));
