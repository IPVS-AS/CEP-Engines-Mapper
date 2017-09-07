import React from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class ThemeProvider extends React.Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(this.props)}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}

export default ThemeProvider;
