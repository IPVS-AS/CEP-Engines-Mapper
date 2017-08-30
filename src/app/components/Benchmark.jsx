import React from 'react';
import { Link } from 'react-router-dom';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Subheader from 'material-ui/Subheader';
import { List, ListItem } from 'material-ui/List';
import ContentAdd from 'material-ui/svg-icons/content/add';

class Topic extends React.Component {
  render() {
    return (
      <ListItem disabled={true}>
        <TextField floatingLabelText="Statement name" />
        <TextField floatingLabelText="Statement query" />
      </ListItem>
    );
  }
}

class Benchmark extends React.Component {
  constructor() {
    super();
    this.state = { topics: [<Topic />] };
  }

  addTopic() {
    this.setState({
      topics: this.state.topics.concat([<Topic />])
    });
  }

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
        <h1>
          {'Benchmark configuration'}
        </h1>
        <TextField
          floatingLabelText="MQTT broker"
          floatingLabelFixed={true}
          defaultValue="tcp://10.0.14.106:1883"
        />
        <TextField
          floatingLabelText="End benchmark topic name"
          floatingLabelFixed={true}
          defaultValue="TemperatureEndEvent"
        />
        <List>
          <Subheader>
            {'Topics'}
          </Subheader>
          {this.state.topics}
          <ListItem
            primaryText="Add new topic"
            leftIcon={<ContentAdd />}
            onClick={this.addTopic}
          />
        </List>
        <List>
          <Subheader>
            {'Statements'}
          </Subheader>
        </List>
      </Paper>
    );
  }
}

export default Benchmark;
