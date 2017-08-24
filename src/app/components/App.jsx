import React from 'react';
import { StaticRouter, Route } from 'react-router';

import Theme from './Theme';
import Master from './Master';

class App extends React.Component {
  render() {
    return (
      <StaticRouter context={{}} location={this.props.url}>
        <Theme>
          <Master />
        </Theme>
      </StaticRouter>
    );
  }
}

export default App;
