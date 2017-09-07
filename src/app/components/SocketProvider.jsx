import React, { Children } from 'react';
import PropTypes from 'prop-types';

class SocketProvider extends React.Component {
  constructor() {
    super();
    this.state = {
      ws: null
    };
  }

  componentDidMount() {
    const host = location.origin.replace(/^http/, 'ws');
    var ws = new WebSocket(host);

    ws.onmessage = message => {
      console.log(message.data);
    };

    var self = this;
    ws.onopen = () => {
      self.setState({ ws: ws });
    };
  }

  componentWillUnmount() {
    this.ws.close();
  }

  getChildContext() {
    return { ws: this.state.ws };
  }

  render() {
    return Children.only(this.props.children);
  }
}

SocketProvider.childContextTypes = {
  ws: PropTypes.object
};

export default SocketProvider;
