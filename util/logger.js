
class Logger{
  constructor(elem){
    this.logElem = elem;
  }
  log(data){
    let d = `<div class='log log-info'>${data}</div>`;
    this.logElem.innerHTML = this.logElem.innerHTML + d;
  }
  logError(data){
    let d = `<div class='log log-error'>${data}</div>`;
    this.logElem.innerHTML = this.logElem.innerHTML + d;
  }
  logWarning(data){
    let d = `<div class='log log-warning'>${data}</div>`;
    this.logElem.innerHTML = this.logElem.innerHTML + d;
  }
}

module.exports = Logger;
