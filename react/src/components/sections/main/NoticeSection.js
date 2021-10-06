import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { formatNewlineToBr } from '../../../utils/commonUtils';


class NoticeSection extends Component {
  render() {
    const { notice } = this.props;

    const formattedContent = formatNewlineToBr(notice.content);

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--feed')}>
      <div className={classNames('subsection', 'subsection--notice')}>
        <div className={classNames('title')}>
          { notice.title }
        </div>
        <div className={classNames('subsection--notice__content')}>
          { formattedContent }
        </div>
      </div>
    </div>
    );
  }
}

NoticeSection.propTypes = {
  notice: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
};


export default withTranslation()(NoticeSection);
