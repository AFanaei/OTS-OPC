const opcua = require("node-opcua");
const OpcMonitor = require("./opcMonitor");

class opcSubscription {
  constructor(session,options){
      this.session = session;
      options.requestedPublishingInterval = options.requestedPublishingInterval || 1000;
      this.PublishingInterval = options.requestedPublishingInterval;
      this.events={
        terminated:[],
        started:[]
      };
      this.monitoredItemList=[];
      this.updateIntervalHandler = setInterval(function(){
        for(var i=0;i<this.monitoredItemList.length;i++){
          this.readNode(this.monitoredItemList[i]);
        }
      }.bind(this),this.PublishingInterval);
      setTimeout(function(){
        this.emit('started');
      }.bind(this),0);
  }
  readNode(monitoredItem){
    var max_age = 0;
    var nodes_to_read = [
       { nodeId: monitoredItem.node.nodeId, attributeId: monitoredItem.node.attributeId }
    ];
    this.session.read(nodes_to_read, max_age, function(err,nodes_to_read,dataValues) {
        if (!err) {
          monitoredItem.updateValue(dataValues[0].value.value);
        }
    });
  }
  on(eventName,callback){
    if(!this.events[eventName]){
      return;
    }
    this.events[eventName].push(callback);
    return this;
  }
  emit(eventName,params){
    if(!this.events[eventName]){
      return;
    }
    for(var i=0;i<this.events[eventName].length;i++){
      this.events[eventName][i].call(this,params);
    }
  }
  terminate(){
    clearInterval(this.updateIntervalHandler);
    this.emit('terminated');
  }

  monitor(node,options){
    let monitored = new OpcMonitor(node,options);
    this.monitoredItemList.push(monitored);
    return monitored;
  }

}


module.exports = opcSubscription;
