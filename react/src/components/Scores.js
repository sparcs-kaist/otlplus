import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

class Scores extends Component {
  render() {
    const { entries, big } = this.props;

    return (
      <div className={classNames('scores', big ? 'scores--big' : null)}>
        {entries.map((e) => (
          <div onMouseOver={e.onMouseOver} onMouseOut={e.onMouseOut} key={e.name}>
            <div>{e.score}</div>
            <div>{e.name}</div>
          </div>
        ))}
      </div>
    );
  }
}

Scores.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      score: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
      onMouseOver: PropTypes.func,
      onMouseOut: PropTypes.func,
    }),
  ).isRequired,
  big: PropTypes.bool,
};

export default Scores;
