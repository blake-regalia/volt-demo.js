/*eslint-env browser*/
export default JSON.parse(atob(document.getElementsByTagName('body')[0].getAttribute('data-all')));
