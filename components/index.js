const OpcHelper = require("../opc/opcHelper");
const Equipment = require('../opc/equipment');

document.getElementById("connect").addEventListener('click',function(event){
  event.preventDefault();

  let endpointUrl = document.getElementById("endPoint").value;
  console.log(endpointUrl);

  let helper = new OpcHelper(endpointUrl);

  let nodes={"A1113A":0, "A1113B":0, "A1113C":0};
  let statusElem = document.getElementById("connectStatus");
  helper.on('statusChange',function(status){
    statusElem.innerText = status;
  })
  helper.DoProcess([
    // find nodes!!!
    function(callback){
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
      this.createSubscription();
      setTimeout(callback,1000);
    }.bind(helper),
    function(callback){
      statusElem.innerText = "done!";

      let rafinate = new Equipment({name:"rafinate"},helper,[nodes["A1113A"]])
      .startMonitoring();
      rafinate.getVariableById("A1113A").subscribe(function(value){
        let rafinateValue = document.getElementById("rafinateValue");
        console.log("rafinateValue:"+value);
        rafinateValue.innerText = Math.round(value*100)/100;
      });
      let distilate = new Equipment({name:"distilate"},helper,[nodes["A1113B"]])
      .startMonitoring();
      distilate.getVariableById("A1113B").subscribe(function(value){
        let distilateValue = document.getElementById("distilateValue");
        console.log("distilateValue:"+value);
        distilateValue.innerText = Math.round(value*100)/100;
      });
      let valve = new Equipment({name:"valve"},helper,[nodes["A1113C"]])
      .startMonitoring();
      valve.getVariableById("A1113C").subscribe(function(value){
        let valveValue = document.getElementById("valveValue");
        console.log("valveValue:"+value);
        valveValue.innerText = Math.round(value*100)/100;
      });
    }
    // function(callback){
    //   let num=0;
    //   for(var i in nodes){
    //     this.readValue(nodes[i],function(key){
    //       return function(result){
    //         nodeValues[key]=result;
    //         num++;
    //         if(num==3){
    //           console.log(nodeValues);
    //           callback();
    //         }
    //       }
    //     }(i));
    //   }
    // }.bind(helper),
    // function(callback) {
    //    this.createSubscription(callback);
    //
    //    // install monitored item
    //   //  for(var i in nodes){
    //   setTimeout(function(){
    //      var monitoredItem  = this.monitorNode(nodes["A1113A"]);
    //
    //      console.log("-------------------------------------");
    //      monitoredItem.on("changed",nodesMonitor["A1113A"]);
    //      monitoredItem.on("err",function(d){console.log("err"+d);});
    //      monitoredItem.on("initialized",function(){console.log("initialized");});
    //      monitoredItem.on("terminated",function(){console.log("terminated");});
    //   //  }
    // }.bind(this),1000);
    // }.bind(helper),
  ]);
});
