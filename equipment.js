
class Equipment{
  constructor(options,helper, nodesToMonitor){
    this.name = options.name;
    this.opcHelper = helper;
    this.nodesToMonitor = nodesToMonitor.map(function(value,index){
      return new EquipmentVar(value);
    });
  }
  startMonitoring(){
    for(var i=0;i<this.nodesToMonitor.length;i++){
      this.nodesToMonitor[i].startMonitoring(this.opcHelper);
    }
    return this;
  }
  stopMonitoring(){
    for(var i=0;i<this.nodesToMonitor.length;i++){
      this.nodesToMonitor[i].stopMonitoring(this.opcHelper);
    }
    return this;
  }
  getVariableById(nodeId){
    for(var i=0;i<this.nodesToMonitor.length;i++){
      let item =this.nodesToMonitor[i];
      if(item.nodeId.value.indexOf(nodeId)!=-1){
        return item;
      }
    }
    return null;
  }
}
class EquipmentVar{
  constructor(nodeId){
    this.nodeId = nodeId;
    this.subscriptions={};
    this.subscriptionId=0;
  }
  publish(value){
    for(var i in this.subscriptions){
      this.subscriptions[i].call(null,value);
    }
  }
  subscribe(callback){
    this.subscriptions[this.subscriptionId]=callback;
  }
  unsubscribe(subscriptionId){
    delete this.subscriptions[this.subscriptionId];
  }
  startMonitoring(helper){
    this.monitoredInterface = helper.monitorNode(this.nodeId);
    this.monitoredInterface.on('changed',function(value){
      this.publish(value);
    }.bind(this));
  }
  stopMonitoring(helper){
    this.monitoredInterface = helper.unMonitorNode(this.nodeId);
  }
}

module.exports = Equipment;
