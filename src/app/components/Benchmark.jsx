import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import { EventItem, EventPropertyItem, StatementItem } from './BenchmarkForm';

import message from '../../message';

class Benchmark extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      broker: 'tcp://10.0.14.106:1883',
      endEventName: 'TemperatureEndEvent',
      events: [
        {
          name: 'TemperatureEvent',
          properties: [
            {
              name: 'temperature',
              type: 'int'
            }
          ]
        }
      ],
      statements: [
        {
          name: 'AverageTemperature',
          query:
            'select avg(temperature) from TemperatureEvent.win:time_batch(5 sec)'
        }
      ]
    };

    this.getEventList = this.getEventList.bind(this);
    this.getStatementList = this.getStatementList.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.addStatement = this.addStatement.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(name, event) {
    const value = event.target.value;
    this.setState(state => {
      var newState = { ...state };
      newState[name] = value;
      return newState;
    });
  }

  handleChangeList(listName, name, index, event) {
    const value = event.target.value;
    this.setState(state => {
      var newState = { ...state };
      newState[listName][index][name] = value;
      return newState;
    });
  }

  handleChangeEventPropertyName(eventIndex, propertyIndex, event) {
    const value = event.target.value;
    this.setState(state => {
      var newState = { ...state };
      newState.events[eventIndex].properties[propertyIndex].name = value;
      return newState;
    });
  }

  handleChangeEventPropertyType(
    eventIndex,
    propertyIndex,
    event,
    index,
    value
  ) {
    this.setState(state => {
      var newState = { ...state };
      newState.events[eventIndex].properties[propertyIndex].type = value;
      return newState;
    });
  }

  getEventList() {
    return this.state.events
      .map((event, index) =>
        <EventItem
          key={index}
          event={event}
          onNameChange={this.handleChangeList.bind(
            this,
            'events',
            'name',
            index
          )}
          getPropertyList={this.getEventPropertyList.bind(this, index)}
          onDelete={this.deleteEvent.bind(this, index)}
        />
      )
      .concat([
        <ListItem
          key={'button'}
          primaryText="Add new event"
          leftIcon={<ContentAdd />}
          onClick={this.addEvent}
        />
      ]);
  }

  getEventPropertyList(eventIndex) {
    return this.state.events[eventIndex].properties
      .map((property, propertyIndex) =>
        <EventPropertyItem
          key={propertyIndex}
          property={property}
          onNameChange={this.handleChangeEventPropertyName.bind(
            this,
            eventIndex,
            propertyIndex
          )}
          onTypeChange={this.handleChangeEventPropertyType.bind(
            this,
            eventIndex,
            propertyIndex
          )}
          onDelete={this.deleteEventProperty.bind(
            this,
            eventIndex,
            propertyIndex
          )}
        />
      )
      .concat([
        <ListItem
          key={'button'}
          primaryText="Add new event property"
          leftIcon={<ContentAdd />}
          onClick={this.addEventProperty.bind(this, eventIndex)}
        />
      ]);
  }

  getStatementList() {
    return this.state.statements
      .map((statement, index) =>
        <StatementItem
          key={index}
          statement={statement}
          onNameChange={this.handleChangeList.bind(
            this,
            'statements',
            'name',
            index
          )}
          onQueryChange={this.handleChangeList.bind(
            this,
            'statements',
            'query',
            index
          )}
          onDelete={this.deleteStatement.bind(this, index)}
        />
      )
      .concat([
        <ListItem
          key={'button'}
          primaryText="Add new statement"
          leftIcon={<ContentAdd />}
          onClick={this.addStatement}
        />
      ]);
  }

  addEvent() {
    this.setState(state => {
      var newState = { ...state };
      newState.events.push({
        name: '',
        properties: [{ name: '', type: 'string' }]
      });
      return newState;
    });
  }

  deleteEvent(index) {
    this.setState(state => {
      var newState = { ...state };
      newState.events.splice(index, 1);
      return newState;
    });
  }

  addEventProperty(index) {
    this.setState(state => {
      var newState = { ...state };
      newState.events[index].properties.push({
        name: '',
        type: 'string'
      });
      return newState;
    });
  }

  deleteEventProperty(eventIndex, propertyIndex) {
    this.setState(state => {
      var newState = { ...state };
      newState.events[eventIndex].properties.splice(propertyIndex, 1);
      return newState;
    });
  }

  addStatement() {
    this.setState(state => {
      var newState = { ...state };
      newState.statements.push({ name: '', query: '' });
      return newState;
    });
  }

  deleteStatement(index) {
    this.setState(state => {
      var newState = { ...state };
      newState.statements.splice(index, 1);
      return newState;
    });
  }

  handleSubmit() {
    this.context.ws.send(
      new message.SetupCepEngineMessage(this.state).toJson()
    );
    this.props.history.push('/console');
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
          {'Benchmark configuration'}
        </h1>
        <TextField
          floatingLabelText="MQTT broker"
          floatingLabelFixed={true}
          value={this.state.broker}
          onChange={this.handleChange.bind(this, 'broker')}
        />
        <TextField
          floatingLabelText="End benchmark topic name"
          floatingLabelFixed={true}
          value={this.state.endEventName}
          onChange={this.handleChange.bind(this, 'endEventName')}
        />
        <List>
          <Subheader>
            {'Events'}
          </Subheader>
          {this.getEventList()}
          <Subheader>
            {'Statements'}
          </Subheader>
          {this.getStatementList()}
        </List>
        <RaisedButton
          style={style.child}
          label="start benchmark"
          primary={true}
          onClick={this.handleSubmit}
        />
      </Paper>
    );
  }
}

Benchmark.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

Benchmark.contextTypes = {
  ws: PropTypes.object
};

export default withRouter(Benchmark);
