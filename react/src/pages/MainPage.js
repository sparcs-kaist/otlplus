import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';
import axios from '../common/presetAxios';
import { BASE_URL } from '../common/constants';

import Footer from '../components/guideline/Footer';

import MyTimetableSection from '../components/sections/main/MyTimetableSection';
import AcademicScheduleSection from '../components/sections/main/AcademicScheduleSection';
import RelatedCourseSection from '../components/sections/main/RelatedCourseSection';
import LatestReviewSection from '../components/sections/main/LatestReviewSection';
import FamousReviewSection from '../components/sections/main/FamousReviewSection';
import ReviewWriteSection from '../components/sections/main/ReviewWriteSection';
import MainSearchSection from '../components/sections/main/MainSearchSection';


class MainPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      feedDays: [],
    };
  }


  componentDidMount() {
    const date = new Date();
    this._fetchFeeds(date);
  }


  _fetchFeeds = (date) => {
    const { feedDays } = this.state;
    const dateString = date.toJSON().slice(0, 10);

    axios.get(`${BASE_URL}/api/feeds`, { params: {
      date: dateString,
    } })
      .then((response) => {
        this.setState({
          feedDays: [
            ...feedDays,
            {
              date: dateString,
              feeds: response.data,
            },
          ],
        });
      })
      .catch((response) => {
      });
  }


  render() {
    const { feedDays } = this.state;

    return (
      <>
        <section className={classNames('main-image')}>
          {/* eslint-disable-next-line react/jsx-indent */}
        <div className={classNames('section-wrap', 'section-wrap--main-search')}>
          <div className={classNames('section')}>
            <MainSearchSection />
          </div>
        </div>
        </section>
        <section className={classNames('content')}>
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
          {
            feedDays.map(d => (
              <React.Fragment key={d.date}>
                <div className={classNames('main-date')}>
                  {d.date}
                </div>
                {d.feeds.map((f) => {
                  if (f.type === 'REVIEW_WRITE') {
                    return (
                    /* eslint-disable-next-line react/jsx-indent */
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <ReviewWriteSection />
            </div>
          </div>
                    );
                  }
                  if (f.type === 'RELATED_COURSE') {
                    return (
                    /* eslint-disable-next-line react/jsx-indent */
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <RelatedCourseSection />
            </div>
          </div>
                    );
                  }
                  if (f.type === 'LATEST_REVIEW') {
                    return (
                    /* eslint-disable-next-line react/jsx-indent */
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <LatestReviewSection />
            </div>
          </div>
                    );
                  }
                  if (f.type === 'FAMOUS_REVIEW') {
                    return (
                    /* eslint-disable-next-line react/jsx-indent */
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <FamousReviewSection department={f.department} reviews={f.reviews} />
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

export default MainPage;
