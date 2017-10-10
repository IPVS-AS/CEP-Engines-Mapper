import React from 'react';
import PropTypes from 'prop-types';
import message from '../../message';

import Paper from 'material-ui/Paper';
import { List, ListItem } from 'material-ui/List';
import HardwareComputer from 'material-ui/svg-icons/hardware/computer';

class Console extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      machineState: '',
      results: []
    };

    this.context.ws.onmessage = msg => {
      console.log(msg.data);
      try {
        var incomingMessage = message.Message.fromJson(msg.data);
        switch (incomingMessage.header.type) {
          case message.Constants.UpdateConsole:
            this.setState(incomingMessage.payload);
            break;
        }
      } catch (err) {
        console.log(err);
      }
    };

    this.getResultList = this.getResultList.bind(this);
  }

  getResultList() {
    const style = this.getStyle();
    return this.state.results.map((result, index) =>
      <ListItem
        key={index}
        nestedItems={[<ListItem primaryText={result.events} />]}
      >
        <div style={style.div}>
          <p>
            {result.statement.name}
          </p>
          <p>
            {result.timestamp}
          </p>
        </div>
      </ListItem>
    );
  }

  getStyle() {
    return {
      root: {
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        padding: '24px',
        minWidth: '40%'
      },
      div: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    };
  }

  render() {
    const style = this.getStyle();
    return (
      <Paper style={style.root}>
        <h1>
          {'Console'}
        </h1>
        <List>
          <ListItem
            primaryText={this.state.machineState}
            leftIcon={<HardwareComputer />}
            nestedItems={this.getResultList()}
          />
        </List>
      </Paper>
    );
  }
}

Console.contextTypes = {
  ws: PropTypes.object
};

export default Console;
