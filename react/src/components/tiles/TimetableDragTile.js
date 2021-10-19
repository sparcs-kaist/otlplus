import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';


const TimetableDragTile = ({
  t,
  dayIndex, beginIndex, endIndex,
  cellWidth, cellHeight,
}) => {
  return (
    <div
      className={classNames('tile', 'tile--timetable-drag')}
      style={{
        left: (cellWidth + 5) * dayIndex + 17,
        width: cellWidth + 2,
        top: cellHeight * beginIndex + 19,
        height: cellHeight * (endIndex - beginIndex) - 3,
      }}
    />
  );
};

TimetableDragTile.propTypes = {
  dayIndex: PropTypes.number.isRequired,
  beginIndex: PropTypes.number.isRequired,
  endIndex: PropTypes.number.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
};

export default withTranslation()(
  React.memo(
    TimetableDragTile
  )
);
