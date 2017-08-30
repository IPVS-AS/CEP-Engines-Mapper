import React from 'react';
import { Link } from 'react-router-dom';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

class Home extends React.Component {
  getStyle() {
    return {
      root: {
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto',
        padding: '24px',
        minWidth: '40%'
      },
      child: {
        margin: 'auto'
      }
    };
  }

  render() {
    const style = this.getStyle();
    return (
      <Paper style={style.root}>
        <p>
          {'HOME'}
        </p>
        <RaisedButton
          style={style.child}
          label="new benchmark"
          primary={true}
          containerElement={<Link to="/benchmark" />}
        />
      </Paper>
    );
  }
}

export default Home;
