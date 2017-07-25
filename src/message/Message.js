class Message {
  constructor(messageType) {
    this.header = {
      version: "0.1.0",
      type: messageType
    };
    this.payload = null;
  }

  toJson() {
    return JSON.stringify(this);
  }

  static fromJson(json) {
    var jsonObject = JSON.parse(json);

    var message = new Message();
    message.header = jsonObject.header;
    message.payload = jsonObject.payload;

    return message;
  }
}

module.exports = Message;
