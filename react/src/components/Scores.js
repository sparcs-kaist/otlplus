import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class Scores extends Component {
  render() {
    const {
      entries,
    } = this.props;

    return (
      <div className={classNames('scores')}>
        {
          entries.map((e) => (
            <div
              onMouseOver={e.onMouseOver}
              onMouseOut={e.onMouseOut}
              key={e.name}
            >
              <div>{ e.score }</div>
              <div>{ e.name }</div>
            </div>
          ))
        }
      </div>
    );
  }
}

Scores.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      score: PropTypes.oneOf(PropTypes.string, PropTypes.node).isRequired,
      onMouseOver: PropTypes.func,
      onMouseOut: PropTypes.func,
    })
  ).isRequired,
};

export default Scores;
