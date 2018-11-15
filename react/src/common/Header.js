import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {connect} from "react-redux";

import '../static/css/components/header/timetable.css';

class Header extends Component {
    render() {
        return (
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container-fluid">
                    <div className="row">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                    data-target="#header" aria-expanded="false">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <Link to="/" className="navbar-brand">OTL</Link>
                        </div>
                        <div className="header-middle collapse navbar-collapse" id="header">
                            <ul className="nav navbar-nav">
                                <li>
                                    <Link to="/timetable/">
                                        모의시간표
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/review/">
                                        따끈따끈 과목후기
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/review/insert/" style={{paddingRight:0}}>
                                        과목후기 작성하기
                                    </Link>
                                </li>
                            </ul>
                            <form className="hid-r navbar-form navbar-left float-right" role="search">
                                <div className="form-group">
                                    <input id="keyword" type="text" name="q" className="form-control" placeholder="Search"/>
                                </div>
                                <button id="option" className="btn btn-default" type="button">필터</button>
                                <button id="search" className="btn btn-default" type="submit"
                                        formAction="/review/result/">검색
                                </button>
                            </form>
                            <ul className="nav navbar-nav navbar-right hid">
                                <li>
                                    <a href="/session/language">
                                        English
                                    </a>
                                </li>
                                {
                                    this.props.user == null
                                    ?   <li>
                                            <a href={`/session/login/?next=${window.location.href}`} className="login">
                                                로그인
                                            </a>
                                        </li>
                                    :   <li className="dropdown">
                                            <a className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                                <span className="header_hide">
                                                    {this.props.user.lastName} {this.props.user.firstName}
                                                </span>
                                                <span className="caret"/>
                                            </a>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <a href="/session/settings">
                                                        마이페이지
                                                    </a>
                                                </li>
                                                <li role="separator" className="divider"/>
                                                <li>
                                                    <a href="https://sparcssso.kaist.ac.kr/account/profile/">
                                                        SPARCSSSO
                                                    </a>
                                                </li>
                                                <li role="separator" className="divider"/>
                                                <li>
                                                    <a href={`/session/logout/?next=${window.location.href}`} className="logout">
                                                        로그아웃
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="header-end collapse navbar-collapse" id="header">
                        <ul className="nav navbar-nav navbar-right">
                            <li>
                                <a href="/session/language">
                                    English
                                </a>
                            </li>
                            {
                                this.props.user == null
                                ?   <li>
                                        <a href={`/session/login/?next=${window.location.href}`} className="login">
                                            로그인
                                        </a>
                                    </li>
                                :   <li class="dropdown">
                                        <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                            <span class="glyphicon glyphicon-user"/>
                                            <span class="header_hide">
                                                {this.props.user.lastName} {this.props.user.firstName}
                                            </span>
                                            <span class="caret"/>
                                        </a>
                                        <ul class="dropdown-menu">
                                            <li>
                                                <a href="/session/settings">
                                                    마이페이지
                                                </a>
                                            </li>
                                            <li role="separator" class="divider"/>
                                            <li>
                                                <a href="https://sparcssso.kaist.ac.kr/account/profile/">
                                                    SPARCSSSO
                                                </a>
                                            </li>
                                            <li role="separator" class="divider"/>
                                            <li>
                                                <a href={`/session/logout/?next=${window.location.href}`} class="logout">
                                                    로그아웃
                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                            }
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        user : state.common.user,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
    }
};

Header = connect(mapStateToProps, mapDispatchToProps)(Header);

export default Header;
