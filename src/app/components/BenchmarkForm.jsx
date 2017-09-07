import React from 'react';

import { ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ContentClear from 'material-ui/svg-icons/content/clear';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export class EventItem extends React.Component {
  render() {
    return (
      <ListItem
        disabled={true}
        innerDivStyle={{ padding: 0 }}
        initiallyOpen={true}
        nestedItems={this.props.getPropertyList()}
      >
        <IconButton onClick={this.props.onDelete}>
          <ContentClear />
        </IconButton>
        <TextField
          floatingLabelText="Event name"
          value={this.props.event.name}
          onChange={this.props.onNameChange}
        />
      </ListItem>
    );
  }
}

export class EventPropertyItem extends React.Component {
  render() {
    return (
      <ListItem disabled={true} innerDivStyle={{ padding: 0 }}>
        <div style={{ display: 'flex' }}>
          <IconButton onClick={this.props.onDelete}>
            <ContentClear />
          </IconButton>
          <TextField
            floatingLabelText="Property name"
            value={this.props.property.name}
            onChange={this.props.onNameChange}
          />
          <SelectField
            floatingLabelText="Property type"
            value={this.props.property.type}
            onChange={this.props.onTypeChange}
          >
            <MenuItem value={'string'} primaryText="String" />
            <MenuItem value={'int'} primaryText="Integer" />
            <MenuItem value={'long'} primaryText="Long" />
            <MenuItem value={'boolean'} primaryText="Boolean" />
            <MenuItem value={'double'} primaryText="Double" />
            <MenuItem value={'float'} primaryText="Float" />
            <MenuItem value={'short'} primaryText="Short" />
            <MenuItem value={'char'} primaryText="Char" />
            <MenuItem value={'byte'} primaryText="Byte" />
          </SelectField>
        </div>
      </ListItem>
    );
  }
}

export class StatementItem extends React.Component {
  render() {
    return (
      <ListItem disabled={true} innerDivStyle={{ padding: 0 }}>
        <IconButton onClick={this.props.onDelete}>
          <ContentClear />
        </IconButton>
        <TextField
          floatingLabelText="Statement name"
          value={this.props.statement.name}
          onChange={this.props.onNameChange}
        />
        <TextField
          floatingLabelText="Statement query"
          value={this.props.statement.query}
          onChange={this.props.onQueryChange}
        />
      </ListItem>
    );
  }
}
