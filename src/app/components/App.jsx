import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';

import Theme from './Theme';
import Master from './Master';
import Home from './Home';
import Benchmark from './Benchmark';

class App extends React.Component {
  getChildContext() {
    return { userAgent: this.props.userAgent };
  }

  render() {
    return (
      <Theme>
        <Master>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/benchmark" component={Benchmark} />
          </Switch>
        </Master>
      </Theme>
    );
  }
}

App.childContextTypes = {
  userAgent: PropTypes.string
};

export default App;
