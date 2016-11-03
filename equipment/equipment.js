
class Equipment{
  constructor(id, options, helper, nodesToMonitor){
    this.id=id;
    this.options = options;
    this.opcHelper = helper;
    this.nodesToMonitor = nodesToMonitor.map((value,index)=>{
      return new EquipmentVar(value,this);
    });
  }
  getNodesWithoutAddress(){
    return this.nodesToMonitor.filter(function(value){ return !value.nodeId;}).map(function(value,index){return value.sName;});
  }
  startMonitoring(){
    let nodes = this.getNodesWithoutAddress();
    if(!this.opcHelper){
      return;
    }
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
      if(item.sName == nodeId || (item.nodeId && item.nodeId.value.indexOf(nodeId)!=-1)){
        return item;
      }
    }
    return null;
  }
  serialize(){
    return {
      id:this.id,
      options:this.options,
      nodes:this.nodesToMonitor.map(function(value,index){ return value.serialize()})
    };
  }
}
class EquipmentVar{
  constructor(obj, parent){
    this.eq = parent;
    this.nodeId = obj.nodeId;
    this.name = obj.name;
    this.sName = obj.sName;
    this.options = Object.assign({
        editable:false,
        maxHistory:100,
      },obj.options);
    this.subscriptions={};
    this.subscriptionId=0;
    this.history=[];
    this.lastValue=-1;
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
      if(this.subscriptions.hasOwnProperty(i)){
        this.subscriptions[i].call(null,value);
      }
    }
  }
  subscribe(callback){
    this.subscriptions[this.subscriptionId]=callback;
    this.subscriptionId++;
    return this.subscriptionId-1;
  }
  unsubscribe(subscriptionId){
    delete this.subscriptions[subscriptionId];
  }
  startMonitoring(helper){
    this.monitoredInterface = helper.monitorNode(this.nodeId);
    this.monitoredInterface.on('changed',(value)=>{
      this.lastValue = value;
      this.log(value);
      this.publish(value);
    });
  }
  stopMonitoring(helper){
    this.monitoredInterface = helper.unMonitorNode(this.nodeId);
  }
  log(value){
    if(this.history.length==this.options.maxHistory){
        this.history.shift();
    }
    //TODO: get time from opcserver.
    this.history.push({x:Date.now(),y:value});
  }
}

module.exports = Equipment;
