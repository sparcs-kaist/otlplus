import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Footer extends Component {
  render() {
    return (
      <footer className="container" style={{ borderTop: '1px solid #d9d0d0', textAlign: 'center', marginTop: 20, paddingTop: 10 }}>
        <p className="info">
          <Link to="/credits/">만든 사람들 </Link>
          |
          <Link to="/licenses/"> 라이선스</Link>
        </p>
        <p className="info">
          <a href="mailto:otlplus@sparcs.org">FeedBack(otlplus@sparcs.org)</a>
        </p>
        <p className="copyright">
          Copyright © 2016,
          <a href="http://sparcs.kaist.ac.kr">
            <span style={{ color: '#FF3399' }}>S</span>
            <span style={{ color: '#33CC66' }}>P</span>
            <span style={{ color: '#00CCFF' }}>A</span>
            <span style={{ color: '#FF9900' }}>R</span>
            <span style={{ color: '#33CCCC' }}>C</span>
            <span style={{ color: '#9966FF' }}>S</span>
          </a>
          OTL Team
        </p>
      </footer>
    );
  }
}

export default Footer;
