import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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
                                <li>
                                    <a className="login">
                                        로그인
                                    </a>
                                </li>
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
                            <li>
                                <a className="login">
                                    로그인
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

export default Header;
