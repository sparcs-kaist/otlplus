import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';
import { BASE_URL } from '../../../common/constants';

import { setUser } from '../../../actions/common/user';
import SearchFilter from '../../SearchFilter';
import userShape from '../../../shapes/UserShape';


class FavoriteDepartmentsSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      department: new Set(['ALL']),
      departmentOptions: [],
    };
  }


  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._setUserDepartment();
    }

    axios.get(`${BASE_URL}/session/department-options`, {
    })
      .then((response) => {
        this.setState({
          departmentOptions: response.data
            .reduce((acc, val) => acc.concat(val), [])
            .map(d => [String(d.id), d.name]),
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
      department: new Set(user.favorite_departments.map(d => String(d.id))),
    });
  }


  updateCheckedValues = filterName => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }


  handleSubmit = (e) => {
    const { department } = this.state;

    e.preventDefault();
    e.stopPropagation();

    axios.post(`${BASE_URL}/session/favorite-departments`, {
      fav_department: Array.from(department),
    })
      .then((response) => {
        this._refetchUser();
      })
      .catch((error) => {
      });
  }


  _refetchUser = () => {
    const { setUserDispatch } = this.props;

    axios.get(`${BASE_URL}/session/info`)
      .then((response) => {
        setUserDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  render() {
    const { t } = this.props;
    const { user } = this.props;
    const { departmentOptions, department } = this.state;

    if (user == null) {
      return null;
    }

    if (!departmentOptions.length) {
      return (
        <>
          <div className={classNames('title')}>
            {t('ui.title.settings')}
          </div>
        </>
      );
    }

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
            checkedValues={this.state.department}
          />
          <div className={classNames('buttons')}>
            <button type="submit" className={classNames('text-button')}>{t('ui.button.save')}</button>
          </div>
        </form>
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
});

const mapDispatchToProps = dispatch => ({
  setUserDispatch: (user) => {
    dispatch(setUser(user));
  },
});

FavoriteDepartmentsSection.propTypes = {
  user: userShape,
  setUserDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(FavoriteDepartmentsSection));
