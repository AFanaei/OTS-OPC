const OpcHelper = require("../opc/opcHelper");
const Equipment = require('../equipment/equipment');
const EqManager = require('../equipment/eqManager');
const ipc = require('electron').ipcRenderer
const bsn = require("bootstrap.native");

let modal = null;
let eqManager = new EqManager();
let helper = null;

ipc.on('new-connection', function (event) {
  modal = new bsn.Modal('#connectionModal');
  modal.open();
});
ipc.on('save-layout', function (event, address) {
  eqManager.saveToFile(address);
});
ipc.on('load-layout', function(event, address) {
  eqManager.loadFromFile(address[0],helper,function(){
    eqManager.startMonitoring(helper);
  });
});

document.getElementById("connect").addEventListener('click',function(event){
  modal.close();

  let endpointUrl = document.getElementById("endPoint").value;

  helper = new OpcHelper(endpointUrl);

  let statusElem = document.getElementById("status");
  helper.on('statusChange',function(status){
    statusElem.innerText = status;
  })
  helper.DoProcess([
    function(callback){
      this.createSubscription();
      setTimeout(callback,1000);
    }.bind(helper),
  ]);
});
