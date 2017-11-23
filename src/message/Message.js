class Message {
  constructor(type) {
    this.type = type;
  }

  toJson() {
    return JSON.stringify(this);
  }

  static fromJson(json) {
    var jsonObject = JSON.parse(json);

    var message = new Message();

    for (var property in jsonObject) {
      if (jsonObject.hasOwnProperty(property)) {
        message[property] = jsonObject[property];
      }
    }

    return message;
  }
}

module.exports = Message;
