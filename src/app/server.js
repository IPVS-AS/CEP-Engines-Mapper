import React from 'react';
import { StaticRouter } from 'react-router-dom';

import App from './components/App';

class Server extends React.Component {
  render() {
    return (
      <StaticRouter location={this.props.url} context={this.props.context}>
        <App userAgent={this.props.userAgent}/>
      </StaticRouter>
    );
  }
}

export default Server;
