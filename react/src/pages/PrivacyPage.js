import React, { Component } from 'react';
import raw from 'raw.macro';
import ReactMarkdown from 'react-markdown';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

const privacyMarkdown = raw('../../PRIVACY.md');

const markdownComponents = {
  h1: (props) => <div {...props} className={classNames('title')} />,
  h2: (props) => <div {...props} className={classNames('small-title')} />,
};

class PrivacyPage extends Component {
  render() {
    return (
      <section className={classNames('content')}>
        <div className={classNames('section-wrap', 'section-wrap--full')}>
          <div className={classNames('section')}>
            <div className={classNames('section-content', 'section-content--privacy')}>
              <ReactMarkdown components={markdownComponents}>{privacyMarkdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default PrivacyPage;
