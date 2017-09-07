import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';

import SocketProvider from './SocketProvider';
import ThemeProvider from './ThemeProvider';
import Master from './Master';
import Home from './Home';
import Benchmark from './Benchmark';

class App extends React.Component {
  render() {
    return (
      <SocketProvider>
        <ThemeProvider userAgent={this.props.userAgent}>
          <Master>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/benchmark" component={Benchmark} />
            </Switch>
          </Master>
        </ThemeProvider>
      </SocketProvider>
    );
  }
}

export default App;
