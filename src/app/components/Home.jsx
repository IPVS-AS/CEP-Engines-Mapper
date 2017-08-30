import React from 'react';
import { Link } from 'react-router-dom';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

class Home extends React.Component {
  render() {
    return (
      <Paper className="home">
        <p>
          {'HOME'}
        </p>
        <RaisedButton
          className="homeButton"
          label="new benchmark"
          primary={true}
          containerElement={<Link to="/benchmark" />}
        />
      </Paper>
    );
  }
}

export default Home;
