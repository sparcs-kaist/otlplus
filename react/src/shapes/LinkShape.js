import PropTypes from 'prop-types';


const linkShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
    hash: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    state: PropTypes.object,
  }),
]);

export default linkShape;
