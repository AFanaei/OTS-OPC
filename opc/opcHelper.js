const opcua = require("node-opcua");
const async = require("async");
const opcSubscription = require("./opcSub");

let client = new opcua.OPCUAClient();

class OpcHelper {
  constructor(endPoint){
    this.endPoint = endPoint;
    this.session = null;
    this.connected = false;
    this.events={
      statusChange:[]
    }
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

  connect(callback){
    this.emit('statusChange','connecting ...')
    client.connect(this.endPoint,function (err) {
      if(err) {
        console.log(" cannot connect to endpoint :" , this.endPoint );
      } else {
        console.log("connected !");
        this.connected=true;
      }
      callback(err);
    }.bind(this));
  }

  createSession(callback){
    this.emit('statusChange','starting session ...')
    client.createSession( function(err,session) {
        if(!err) {
          this.session = session;
        }
        callback(err);
    }.bind(this));
  }

  getNodeIdByPath(startNode, paths, callback){ // objects, ...
    let pathDict={};
    let num=0;
    for(let i=0;i<paths.length;i++){
      let item = paths[i];
      let parts = item.split('/');
      let childName = parts.shift();
      this.getChildrenNode(startNode,childName,parts,(function(i){
        return function(result){
          pathDict[i]=result;
          num++;
          if(num==paths.length){
            callback(pathDict);
          }
        }
      }(item)));
    }
  }

  getChildrenNode(rootNode,childName,Next,callback){
    this.emit('statusChange','browsing')
    console.log(rootNode+"....");
    this.session.browse(rootNode, function(err,browse_result){
      if(!err) {
        for(let i=0;i<browse_result[0].references.length;i++){
          let item = browse_result[0].references[i];
          console.log(`    -> ${item.displayName.text}`);
          if(item.displayName.text == childName){
            if(Next.length==0){
              callback(item.nodeId);
            }else{
              let newChildName = Next.shift();
              this.getChildrenNode(item.nodeId,newChildName,Next,callback);
            }
            return;
          }
        }
        callback({error:true});
        return;
      }
      callback({error:err});
    }.bind(this));
  }

  readValue(nodeId,callback){
    this.session.readVariableValue(nodeId, function(err,dataValue) {
      if (!err) {
        callback(dataValue);
        return;
      }
      callback(err);
    });
  }

  writeValue(nodeId,value,callback){
    this.session.writeSingleNode(nodeId, value, function(err,statusCode,info) {
      if(!callback)
        return ;
      if (!err) {
        callback(statusCode);
        return;
      }
      callback(err);
    });
  }

  createSubscription(callback){
    this.subscription = new opcSubscription(this.session,{
        requestedPublishingInterval: 1000,
    });
    this.subscription.on("started",function(){
        console.log("subscription started");
    }).on("terminated",function(){
      if(callback){
        callback();
      }
    });

    //  setTimeout(function(){
    //      this.subscription.terminate();
    //  }.bind(this),6000);
  }

  monitorNode(nodeId){
    return this.subscription.monitor({
        nodeId: nodeId,
        attributeId: opcua.AttributeIds.Value,
    },
    {
        clientHandle:13,
        samplingInterval: 1000,
        discardOldest: true,
        queueSize: 10
    });
  }

  closeSession(callback){
    this.session.close(function(err){
        if(err) {
            console.log("session closed failed ?");
        }
        this.session=null;
        callback(err);
    }.bind(this));
  }

  DoProcess(tasks){
    let asyncCom=[];
    if(!this.connected){
      asyncCom = [
        function(callback){
          console.log("connect");
          this.connect(callback);
        }.bind(this)
      ];
    }
    if(!this.session){
      asyncCom.push(
        function(callback){
          console.log("session");
          this.createSession(callback);
        }.bind(this)
      );
      asyncCom = asyncCom.concat(tasks);
    }else{
      asyncCom=tasks;
    }

    async.series(asyncCom,
      function(err) {
        if (err) {
            console.log(" failure ",err);
        } else {
            console.log("done!");
        }
      }
    );
  }
}

module.exports = OpcHelper;
