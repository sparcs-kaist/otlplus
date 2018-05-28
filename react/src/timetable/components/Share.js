import React, { Component } from 'react';

class Share extends Component {
    render() {
        return (
            <div id="share-buttons" className="authenticated">
                <a className="share-button" id="image" download>
                </a>
                <a className="share-button" id="calendar" target="_blank">
                </a>
            </div>
        );
    }
}

export default Share;
