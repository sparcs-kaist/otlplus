import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { formatNewlineToBr } from '../../../common/utilFunctions';


class NoticeSection extends Component {
  render() {
    const { notice } = this.props;

    const formattedContent = formatNewlineToBr(notice.content);

    return (
      <div className={classNames('section-content', 'section-content--notice')}>
        <div className={classNames('title')}>
          { notice.title }
        </div>
        <div className={classNames('section-content--notice__content')}>
          { formattedContent }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  semesters: state.common.semester.semesters,
});

const mapDispatchToProps = (dispatch) => ({
});

NoticeSection.propTypes = {
  notice: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(NoticeSection));
