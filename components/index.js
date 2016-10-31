const OpcHelper = require("../opc/opcHelper");
const Equipment = require('../equipment/equipment');
const EqManager = require('../equipment/eqManager');
const Logger = require("../util/logger");
const ipc = require('electron').ipcRenderer
const bsn = require("bootstrap.native");

const eqManager = new EqManager();
const logger = new Logger(document.getElementById("logs"));
let helper = null;
let modal = null;

ipc.on('new-connection', function (event) {
  modal = new bsn.Modal('#connectionModal');
  modal.open();
});
ipc.on('save-layout', function (event, address) {
  try{
    eqManager.saveToFile(address);
  }catch(e){
    Logger.logError(e);
  }
});
ipc.on('load-layout', function(event, address) {
  try{
    eqManager.loadFromFile(address[0],helper,function(){
      let {tag, variable}=eqManager.renderLayout();
      document.getElementById('eq-container').innerHTML = tag;
      variable.forEach((x)=>{
        x.subscribe((newValue)=>{
          document.getElementById(`sName-${x.sName}`).innerHTML = Math.round(newValue*100)/100;
        });
      });
      eqManager.startMonitoring(helper);
    });
  }catch(e){
    Logger.logError(e);
  }
});

document.getElementById("connect").addEventListener('click',function(event){
  modal.close();

  let endpointUrl = document.getElementById("endPoint").value;

  helper = new OpcHelper(endpointUrl);

  let statusElem = document.getElementById("status");
  helper.on('statusChange',function(status){
    statusElem.innerText = status;
  })
  try{
    helper.DoProcess([
      function(callback){
        this.createSubscription();
        setTimeout(callback,1000);
      }.bind(helper),
    ]);
  }catch(e){
    Logger.logError(e);
  }
});
