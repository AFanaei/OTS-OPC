
class Equipment{
  constructor(id,options, helper, nodesToMonitor){
    this.id=id;
    this.options = options;
    this.opcHelper = helper;
    this.nodesToMonitor = nodesToMonitor.map(function(value,index){
      return new EquipmentVar(value);
    });
  }
  getNodesWithoutAddress(){
    return this.nodesToMonitor.filter(function(value){ return !value.nodeId;}).map(function(value,index){return value.sName;});
  }
  startMonitoring(){
    let nodes = this.getNodesWithoutAddress();
    if(nodes.length){
      this.opcHelper.DoProcess([
        // find nodes!!!
        function(callback){
          if(nodes.length==0){
            callback(); // all nodes are known
          }
          this.getNodeIdByPath("RootFolder",["Objects/Infoplus/DefinitionRecords/IP_AnalogDef"],function(res){
            let item = res[Object.keys(res)[0]];
            if(item.error){
              callback(item.error);
            }else{
              this.getNodeIdByPath(item,nodes,function(nodeIds){
                nodes=nodeIds;
                callback();
              });
            }
          }.bind(this));
        }.bind(this.opcHelper),

        function(callback){
          for(var i in nodes){
            this.getVariableById(i).nodeId=nodes[i];
          }
          for(var i=0;i<this.nodesToMonitor.length;i++){
            this.nodesToMonitor[i].subscribe(function(value){
              console.log("rafinateValue:"+value);
            });
            this.nodesToMonitor[i].startMonitoring(this.opcHelper);
          }
        }.bind(this)
      ]);
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
      if(item.sName == nodeId || item.nodeId.value.indexOf(nodeId)!=-1){
        return item;
      }
    }
    return null;
  }
  serialize(){
    return {
      id:1,
      options:this.options,
      nodes:this.nodesToMonitor.map(function(value,index){ return value.serialize()})
    };
  }
}
class EquipmentVar{
  constructor(obj){
    this.nodeId = obj.nodeId;
    this.name = obj.name;
    this.sName = obj.sName;
    this.options = obj.options;
    this.subscriptions={};
    this.subscriptionId=0;
  }
  serialize(){
    return {
      nodeId: this.nodeId,
      sName: this.sName,
      name: this.name,
      options: this.options
    };
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
