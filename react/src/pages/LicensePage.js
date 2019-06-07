import React, { Component } from 'react';

import Header from '../componenets/Header';
import Footer from '../componenets/Footer';


class LicensePage extends Component {
  render() {
    return (
      <div>
        <Header user={this.props.user} />
        <section id="contents" className="container-fluid">
          <div className="row">
            <div
              className="col-xs-22 col-xs-offset-1 col-sm-20 col-sm-offset-2 col-md-18 col-md-offset-3 col-lg-16 col-lg-offset-4">

              <div className="list-group sort_result">
                <div
                  className="list-group-item"
                  style={{ borderRadius: 4, marginTop: 20, textAlign: 'center', padding: '20px 50px 20px 50px' }}
                >
                  <h2> Licenses </h2>
                  <p style={{ borderTop: '1px solid #eee', margin: 20 }}>
                    <h4>ZURB In Tutorial</h4>
                    ====<br />
                    <br />
                    Joyride was made by [ZURB](http://www.zurb.com), a product design company in Campbell, CA.<br />
                    <br />
                    If Joyride knocks your socks off the way we hope it does and you want more, why not check out [our
                    jobs](http://www.zurb.com/talent/jobs)?<br />
                    <br />
                    MIT Open Source License<br />
                    =======================<br />
                    <br />
                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
                    associated documentation files (the &quat;Software&quat;), to deal in the Software without restriction, including
                    without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
                    following conditions:<br />
                    <br />
                    The above copyright notice and this permission notice shall be included in all copies or substantial
                    portions of the Software.<br />
                    <br />
                    THE SOFTWARE IS PROVIDED &quat;AS IS&quat;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
                    LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                    NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
                    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
                    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                  </p>

                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }
}

export default LicensePage;
