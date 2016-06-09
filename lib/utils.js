function localStoragePresent(){
  var test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

export function persist(namespace, data) {
  if (localStoragePresent()) {
    let allData = Object.assign(retrieve(namespace), data);
    for (let dataKey in allData) {
      if (!allData[dataKey]) { delete allData[dataKey]; }
    }
    localStorage.setItem(namespace, JSON.stringify(allData || {}));
    return data;
  } else {
    // TODO: Safari Private Browsing 
  }
}

export function retrieve(namespace) {
  if (localStoragePresent()) {
    let data = localStorage.getItem(namespace);
    return JSON.parse(data || "{}");
  } else {
    // TODO: Safari Private Browsing 
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}
