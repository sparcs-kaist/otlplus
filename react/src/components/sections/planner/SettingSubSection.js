import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import userShape from '../../../shapes/model/UserShape';
import Attributes from '../../Attributes';

class SettingSubSection extends Component {

  render() {
		const { t } = this.props;
		const { user } = this.props;
		let entranceYear = 0;

		if (user == null) {
			return null;
		} else {
			entranceYear = parseInt(user.student_id.substring(0, 4));	// 어떤 졸업요건에 해당되는지 체크하기
		}

    return(
      <>
        <div className={classNames('subsection', 'subsection--planner-setting')}>
          <Attributes
            entries={[
                { name: t('ui.attribute.default'), info: entranceYear },
								{ name: t('ui.attribute.major'), info: user.majors.map((d) => d[t('js.property.name')]).join(', ') },
                { name: t('ui.attribute.additional'), info: "복수 - 전산학부" },
            ]}
            longInfo
          />
        </div>
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
});

SettingSubSection.propTypes = {
  user: userShape,
};

export default withTranslation()(
	connect(mapStateToProps, mapDispatchToProps)(
		SettingSubSection
	)
);