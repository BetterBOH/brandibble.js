export default class Events {
  constructor() {
    this._callStack = [];
  }

  triggerAsync(key, promise) {
    promise.then((response) => {
      this.trigger(`${key}.success`, response);
      return response;
    }).catch((response) => {
      this.trigger(`${key}.failure`, response);
      return response;
    });
  }

  trigger(key, response) {
    this._callStack.forEach(func => func(key, response));
  }

  subscribe(callback) {
    this._callStack.push(callback);
  }
}
