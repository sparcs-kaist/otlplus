import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

class DictionaryRouter extends Component {
    render() {
        return (
            <Switch>
                <Route exact path="/" component={MainPage}/>
                <Route exact path="/" component={MainPage}/>
            </Switch>
        );
    }
}

export default DictionaryRouter;