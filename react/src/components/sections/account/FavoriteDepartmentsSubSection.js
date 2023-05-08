import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import SearchFilter from '../../SearchFilter';

import { setUser } from '../../../actions/common/user';

import userShape from '../../../shapes/model/session/UserShape';


class FavoriteDepartmentsSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      savedSelectedDepartments: new Set([]),
      selectedDepartments: new Set([]),
      allDepartments: [],
    };
  }


  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._setUserDepartment();
    }

    axios.get(
      '/session/department-options',
      {
      },
    )
      .then((response) => {
        this.setState({
          allDepartments: response.data
            .flat(1),
        });
      })
      .catch((error) => {
      });
  }


  componentDidUpdate(prevProps) {
    const { user } = this.props;

    if (!prevProps.user && user) {
      this._setUserDepartment();
    }
  }


  _setUserDepartment = () => {
    const { user } = this.props;

    this.setState({
      savedSelectedDepartments: new Set(user.favorite_departments.map((d) => String(d.id))),
      selectedDepartments: new Set(user.favorite_departments.map((d) => String(d.id))),
    });
  }


  updateCheckedValues = (filterName) => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }


  handleSubmit = (e) => {
    const { selectedDepartments } = this.state;

    e.preventDefault();
    e.stopPropagation();

    axios.post(
      '/session/favorite-departments',
      {
        fav_department: Array.from(selectedDepartments).filter((d) => (d !== 'ALL')),
      },
      {
      },
    )
      .then((response) => {
        this.setState({
          savedSelectedDepartments: selectedDepartments,
        });
        this._refetchUser();
      })
      .catch((error) => {
      });
  }


  _refetchUser = () => {
    const { setUserDispatch } = this.props;

    axios.get(
      '/session/info',
      {
        metadata: {
          gaCategory: 'User',
          gaVariable: 'GET / Instance',
        },
      },
    )
      .then((response) => {
        setUserDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  render() {
    const { t } = this.props;
    const { user } = this.props;
    const { allDepartments, savedSelectedDepartments, selectedDepartments } = this.state;

    if (user == null) {
      return null;
    }

    const departmentOptions = allDepartments
      .map((d) => [String(d.id), `${d[t('js.property.name')]} (${d.code})`]);

    const hasChange = (selectedDepartments.size !== savedSelectedDepartments.size)
      || Array.from(selectedDepartments).some((d) => !savedSelectedDepartments.has(d));

    const favoriteDepartmentForm = (
      allDepartments.length === 0
        ? null
        : (
          <form onSubmit={this.handleSubmit}>
            <SearchFilter
              updateCheckedValues={this.updateCheckedValues('selectedDepartments')}
              inputName="department"
              titleName={t('ui.search.favoriteDepartment')}
              options={departmentOptions}
              checkedValues={selectedDepartments}
            />
            <div className={classNames('buttons')}>
              { hasChange
                ? <button type="submit" className={classNames('text-button')}>{t('ui.button.save')}</button>
                : <button className={classNames('text-button', 'text-button--disabled')}>{t('ui.button.save')}</button>
              }
            </div>
          </form>
        )
    );

    return (
      <div className={classNames('subsection', 'subsection--favorite-department')}>
        <div className={classNames('title')}>
          {t('ui.title.settings')}
        </div>
        { favoriteDepartmentForm }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
  setUserDispatch: (user) => {
    dispatch(setUser(user));
  },
});

FavoriteDepartmentsSubSection.propTypes = {
  user: userShape,

  setUserDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    FavoriteDepartmentsSubSection
  )
);
