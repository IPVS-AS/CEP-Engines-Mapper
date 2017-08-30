import React from 'react';

import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';

import { lightWhite, grey900 } from 'material-ui/styles/colors';

class Master extends React.Component {
  getStyle() {
    return {
      content: {
        display: 'flex',
        padding: '24px 12px'
      },
      footer: {
        position: 'fixed',
        bottom: '0px',
        width: '100%',
        backgroundColor: grey900,
        padding: '24px'
      },
      p: {
        color: lightWhite
      }
    };
  }

  render() {
    const style = this.getStyle();
    return (
      <div>
        <link rel="stylesheet" type="text/css" href="/static/style.css" />
        <AppBar title="CEP Engine Benchmarking" showMenuIconButton={false} />
        <Paper style={style.content} rounded={false}>
          {this.props.children}
        </Paper>
        <Paper style={style.footer} rounded={false}>
          <p style={style.p}>
            {'Developed at IPVS'}
          </p>
        </Paper>
      </div>
    );
  }
}

export default Master;
