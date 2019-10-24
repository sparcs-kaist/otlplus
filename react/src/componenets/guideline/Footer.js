import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { guidelineBoundClassNames as classNames } from '../../common/boundClassNames';

import logoImage from '../../static/img/SPARCS_black.svg';


class Footer extends Component {
  render() {
    return (
      <footer>
        <div className={classNames('content')}>
          <div className={classNames('content-left', 'reverse')}>
            <div className={classNames('logo')}>
              <span>
                <a href="http://sparcs.org" target="_blank" rel="noopener noreferrer">
                  <img src={logoImage} alt="OTL Logo" />
                </a>
              </span>
            </div>
            <div className={classNames('menus')}>
              <span>
                <Link to="/credits">
                  만든 사람들
                </Link>
              </span>
              <span>
                <Link to="/licenses">
                  라이선스
                </Link>
              </span>
            </div>
          </div>
          <div className={classNames('contact')}>
            <span>
              <a href="mailto:otlplus@sparcs.org">otlplus@sparcs.org</a>
            </span>
          </div>
        </div>
      </footer>
    );
  }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

Footer.propTypes = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
