import React from 'react';

import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';

class Master extends React.Component {
  render() {
    return (
      <div>
        <link rel="stylesheet" type="text/css" href="/static/style.css" />
        <AppBar title="CEP Engine Benchmarking" showMenuIconButton={false} />
        {this.props.children}
        <Paper className="footer" rounded={false}>
          <p>
            {'Developed at IPVS'}
          </p>
        </Paper>
      </div>
    );
  }
}

export default Master;
