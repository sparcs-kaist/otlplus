import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';
import axios from '../common/presetAxios';

import Footer from '../components/guideline/Footer';
import MyTimetableSection from '../components/sections/main/MyTimetableSection';
import AcademicScheduleSection from '../components/sections/main/AcademicScheduleSection';
import VisitorSection from '../components/sections/main/VisitorSection';
import RelatedCourseSection from '../components/sections/main/RelatedCourseSection';
import LatestReviewSection from '../components/sections/main/LatestReviewSection';
import FamousMajorReviewSection from '../components/sections/main/FamousMajorReviewSection';
import FamousHumanityReviewSection from '../components/sections/main/FamousHumanityReviewSection';
import ReviewWriteSection from '../components/sections/main/ReviewWriteSection';
import MainSearchSection from '../components/sections/main/MainSearchSection';
import userShape from '../shapes/UserShape';


class MainPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      feedDays: [],
      loading: false,
    };
  }


  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);

    const date = new Date();
    this._fetchFeeds(date);
  }


  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }


  handleScroll = (e) => {
    const { loading } = this.state;
    const SCROLL_BOTTOM_PADDING = 100;
    if (loading) {
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
    const { feedDays, loading } = this.state;

    if (loading) {
      return;
    }

    this.setState({
      loading: true,
    });

    if (this._getDateDifference(date) >= 7) {
      return;
    }

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
          loading: false,
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
    const currentDate = new Date();
    copiedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    const timeDiff = currentDate - copiedDate;
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
              <MyTimetableSection />
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
            : feedDays.map(d => (
              <React.Fragment key={d.date}>
                <div className={classNames('main-date')}>
                  {getDateName(d.date)}
                </div>
                {d.feeds.map((f) => {
                  if (f.type === 'REVIEW_WRITE') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}-${f.lecture.id}`}>
                        <div className={classNames('section')}>
                          <ReviewWriteSection lecture={f.lecture} review={user.reviews.find(r => (r.lecture.id === f.lecture.id))} />
                        </div>
                      </div>
                    );
                  }
                  if (f.type === 'RELATED_COURSE') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}-${f.course.id}`}>
                        <div className={classNames('section')}>
                          <RelatedCourseSection course={f.course} />
                        </div>
                      </div>
                    );
                  }
                  if (f.type === 'LATEST_REVIEW') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}`}>
                        <div className={classNames('section')}>
                          <LatestReviewSection />
                        </div>
                      </div>
                    );
                  }
                  if (f.type === 'FAMOUS_MAJOR_REVIEW') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}-${f.department.code}`}>
                        <div className={classNames('section')}>
                          <FamousMajorReviewSection department={f.department} reviews={f.reviews} />
                        </div>
                      </div>
                    );
                  }
                  if (f.type === 'FAMOUS_HUMANITY_REVIEW') {
                    return (
                      <div className={classNames('section-wrap')} key={`${d.date}-${f.type}`}>
                        <div className={classNames('section')}>
                          <FamousHumanityReviewSection reviews={f.reviews} />
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

const mapStateToProps = state => ({
  user: state.common.user.user,
});

const mapDispatchToProps = dispatch => ({
});

MainPage.propTypes = {
  user: userShape,
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(MainPage));
