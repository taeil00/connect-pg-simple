const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get("error");
if (message) {
  let element = <p>{message}. Use different user name!</p>;
  ReactDOM.render(element, document.getElementById("message"));
}
