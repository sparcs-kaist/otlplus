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
import LatestReviewFeedSection from '../components/sections/main/LatestReviewFeedSection';
import FamousMajorReviewFeedSection from '../components/sections/main/FamousMajorReviewFeedSection';
import FamousHumanityReviewFeedSection from '../components/sections/main/FamousHumanityReviewFeedSection';
import ReviewWriteFeedSection from '../components/sections/main/ReviewWriteFeedSection';
import MainSearchSection from '../components/sections/main/MainSearchSection';
import userShape from '../shapes/UserShape';


class MainPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      feedDays: [],
      isLoading: false,
    };
  }


  componentDidMount() {
    const { user } = this.props;

    window.addEventListener('scroll', this.handleScroll);

    const today = new Date();
    if (user) {
      this._fetchFeeds(today);
    }
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
    const { isLoading } = this.state;
    const SCROLL_BOTTOM_PADDING = 100;
    if (isLoading) {
      return;
    }

    if ((window.scrollY + window.innerHeight) > (document.body.scrollHeight - SCROLL_BOTTOM_PADDING)) {
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

    if (isLoading) {
      return;
    }
    if (this._getDateDifference(date) >= 7) {
      return;
    }

    this.setState({
      isLoading: true,
    });

    const dateString = date.toJSON().slice(0, 10);

    axios.get(
      '/api/feeds',
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
    const { feedDays } = this.state;
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

    return (
      <>
        <section className={classNames('main-image')}>

          <div className={classNames('section-wrap', 'section-wrap--main-search')}>
            <div className={classNames('section')}>
              <MainSearchSection />
            </div>
          </div>
        </section>
        <section className={classNames('content', 'content--main')}>
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <TodaysTimetableSection />
            </div>
          </div>
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <AcademicScheduleSection />
            </div>
          </div>
          {!user
            ? (
              <>
                <div className={classNames('main-date')}>
                  {t('ui.others.today')}
                </div>
                <div className={classNames('section-wrap')}>
                  <div className={classNames('section')}>
                    <VisitorSection />
                  </div>
                </div>
              </>
            )
            : feedDays.map((d) => (
              <React.Fragment key={d.date}>
                <div className={classNames('main-date')}>
                  {getDateName(d.date)}
                </div>
                {d.feeds.map((f) => {
                  if (f.type === 'REVIEW_WRITE') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}-${f.lecture.id}`}>
                        <div className={classNames('section')}>
                          <ReviewWriteFeedSection
                            lecture={f.lecture}
                            review={user.reviews.find((r) => (r.lecture.id === f.lecture.id))}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (f.type === 'RELATED_COURSE') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}-${f.course.id}`}>
                        <div className={classNames('section')}>
                          <RelatedCourseFeedSection course={f.course} />
                        </div>
                      </div>
                    );
                  }
                  if (f.type === 'LATEST_REVIEW') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}`}>
                        <div className={classNames('section')}>
                          <LatestReviewFeedSection />
                        </div>
                      </div>
                    );
                  }
                  if (f.type === 'FAMOUS_MAJOR_REVIEW') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}-${f.department.code}`}>
                        <div className={classNames('section')}>
                          <FamousMajorReviewFeedSection
                            department={f.department}
                            reviews={f.reviews}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (f.type === 'FAMOUS_HUMANITY_REVIEW') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}`}>
                        <div className={classNames('section')}>
                          <FamousHumanityReviewFeedSection reviews={f.reviews} />
                        </div>
                      </div>
                    );
                  }
                  return null;
                })
                }
              </React.Fragment>
            ))
          }
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
