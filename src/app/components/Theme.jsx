import React from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class Theme extends React.Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(this.context)}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}

Theme.contextTypes = {
  userAgent: PropTypes.string
};

export default Theme;
