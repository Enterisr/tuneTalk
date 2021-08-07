const Utils = {
  GetServerURI: function() {
    return window.location.href.includes(":3000")
      ? `http://${window.location.hostname}:5000`
      : `https://${window.location.hostname}`;
  },
};
export default Utils;
