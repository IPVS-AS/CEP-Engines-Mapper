import React from 'react';
import { StaticRouter, Route, Switch } from 'react-router';

import Theme from './Theme';
import Master from './Master';
import Home from './Home';
import Benchmark from './Benchmark';

class App extends React.Component {
  render() {
    return (
      <Theme>
        <Master>
          <Benchmark />
        </Master>
      </Theme>
    );
  }
}

export default App;
