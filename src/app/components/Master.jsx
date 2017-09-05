import React from 'react';

import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';

import { lightWhite, grey900 } from 'material-ui/styles/colors';

class Master extends React.Component {
  getStyle() {
    return {
      root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      },
      content: {
        display: 'flex',
        flex: 1,
        padding: '24px 12px',
        overflow: 'auto'
      },
      footer: {
        width: '100%',
        backgroundColor: grey900,
        padding: '24px'
      },
      p: {
        color: lightWhite,
        textAlign: 'center'
      }
    };
  }

  render() {
    const style = this.getStyle();
    return (
      <div style={style.root}>
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
