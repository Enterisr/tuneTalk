let utils = {
  selectRandomFromArray: function selectRandomFromArray(arr) {
    const rnd = Math.floor(Math.random() * arr.length);
    return arr[rnd];
  },
  generateRandomString(length) {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
};

module.exports = utils;
