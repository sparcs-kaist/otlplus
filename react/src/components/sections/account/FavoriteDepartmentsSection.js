import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import SearchFilter from '../../SearchFilter';

import { setUser } from '../../../actions/common/user';

import userShape from '../../../shapes/UserShape';


class FavoriteDepartmentsSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      savedDepartment: new Set([]),
      department: new Set([]),
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
            .reduce((acc, val) => acc.concat(val), []),
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
      savedDepartment: new Set(user.favorite_departments.map((d) => String(d.id))),
      department: new Set(user.favorite_departments.map((d) => String(d.id))),
    });
  }


  updateCheckedValues = (filterName) => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }


  handleSubmit = (e) => {
    const { department } = this.state;

    e.preventDefault();
    e.stopPropagation();

    axios.post(
      '/session/favorite-departments',
      {
        fav_department: Array.from(department).filter((d) => (d !== 'ALL')),
      },
      {
      },
    )
      .then((response) => {
        this.setState({
          savedDepartment: department,
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
    const { allDepartments, savedDepartment, department } = this.state;

    if (user == null) {
      return null;
    }

    if (!allDepartments.length) {
      return (
        <>
          <div className={classNames('title')}>
            {t('ui.title.settings')}
          </div>
        </>
      );
    }

    const departmentOptions = allDepartments
      .map((d) => [String(d.id), d[t('js.property.name')]]);

    const hasChange = (department.size !== savedDepartment.size)
      || Array.from(department).some((d) => !savedDepartment.has(d));

    return (
      <>
        <div className={classNames('title')}>
          {t('ui.title.settings')}
        </div>
        <form onSubmit={this.handleSubmit}>
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('department')}
            inputName="department"
            titleName={t('ui.search.favoriteDepartment')}
            options={departmentOptions}
            checkedValues={department}
          />
          <div className={classNames('buttons')}>
            { hasChange
              ? <button type="submit" className={classNames('text-button')}>{t('ui.button.save')}</button>
              : <button className={classNames('text-button', 'text-button--disabled')}>{t('ui.button.save')}</button>
            }
          </div>
        </form>
      </>
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

FavoriteDepartmentsSection.propTypes = {
  user: userShape,

  setUserDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(FavoriteDepartmentsSection));
