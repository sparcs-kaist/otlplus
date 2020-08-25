import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class LicensePage extends Component {
  render() {
    return (
      <section className={classNames('content', 'content--no-scroll')}>
        <div className={classNames('section-wrap', 'section-wrap--full')}>
          <div className={classNames('section')}>
            <div className={classNames('section-content', 'section-content--license')}>

              <div className={classNames('title')}> Licenses </div>
              
              <div>
                <div className={classNames('small-title')}>ZURB In Tutorial</div>
                Joyride was made by [ZURB](http://www.zurb.com), a product design company in Campbell, CA.
                <br />
                If Joyride knocks your socks off the way we hope it does and you want more, why not check out [our
                jobs](http://www.zurb.com/talent/jobs)?
                <div className={classNames('divider')} />
                <div className={classNames('small-title')}>MIT Open Source License</div>
                Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
                associated documentation files (the &quat;Software&quat;), to deal in the Software without restriction, including
                without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
                following conditions:
                <br />
                The above copyright notice and this permission notice shall be included in all copies or substantial
                portions of the Software.
                <br />
                THE SOFTWARE IS PROVIDED &quat;AS IS&quat;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
                LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
                WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
                SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default LicensePage;
