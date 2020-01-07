import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class WriteReviewsPage extends Component {
  render() {
    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--left', 'section-wrap--mobile-full')}>
            <div className={classNames('section')}>
              123
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--right')}>
            <div className={classNames('section')}>
              123
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

WriteReviewsPage.propTypes = {
};


export default connect(mapStateToProps, mapDispatchToProps)(WriteReviewsPage);
