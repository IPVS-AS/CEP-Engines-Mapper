import React from 'react';
import PropTypes from 'prop-types';
import message from '../../message';

import Paper from 'material-ui/Paper';

class Console extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {};

    this.context.ws.onmessage = msg => {
      console.log(msg.data);
      try {
        var incomingMessage = message.Message.fromJson(msg.data);
        switch (incomingMessage.header.type) {
          case message.Constants.UpdateConsole:
            break;
        }
      } catch (err) {
        console.log(err);
      }
    };
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
          {'Console'}
        </h1>
      </Paper>
    );
  }
}

Console.contextTypes = {
  ws: PropTypes.object
};

export default Console;
