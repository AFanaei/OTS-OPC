const OpcHelper = require("./opcHelper");

let endpointUrl = "opc.tcp://" + require("os").hostname() + ":21381/MatrikonOpcUaWrapper";

let helper = new OpcHelper(endpointUrl);

let nodes={"A1113A":0, "A1113B":0, "A1113C":0};
let nodeValues={"A1113A":0, "A1113B":0, "A1113C":0};
let nodesMonitor={"A1113A":function(val){ console.log("first:"+val);},
  "A1113B":function(val){ console.log("second:"+val);},
  "A1113C":function(val){ console.log("third:"+val);}};

helper.DoProcess([
  // find nodes!!!
  function(callback){
    console.log("root folder....");
    this.getNodeIdByPath("RootFolder",["Objects/Infoplus/DefinitionRecords/IP_AnalogDef"],function(res){
      let item = res[Object.keys(res)[0]];
      if(item.error){
        callback(item.error);
      }else{
        this.getNodeIdByPath(item,Object.keys(nodes),function(nodeIds){
          nodes=nodeIds;
          callback();
        });
      }
    }.bind(this));
  }.bind(helper),
  function(callback){
    let num=0;
    for(var i in nodes){
      this.readValue(nodes[i],function(key){
        return function(result){
          nodeValues[key]=result;
          num++;
          if(num==3){
            console.log(nodeValues);
            callback();
          }
        }
      }(i));
    }
  }.bind(helper),
  function(callback) {
     this.createSubscription(callback);

     // install monitored item
    //  for(var i in nodes){
    setTimeout(function(){
       var monitoredItem  = this.monitorNode(nodes["A1113A"]);

       console.log("-------------------------------------");
       monitoredItem.on("changed",nodesMonitor["A1113A"]);
       monitoredItem.on("err",function(d){console.log("err"+d);});
       monitoredItem.on("initialized",function(){console.log("initialized");});
       monitoredItem.on("terminated",function(){console.log("terminated");});
    //  }
  }.bind(this),1000);
  }.bind(helper),
]);
