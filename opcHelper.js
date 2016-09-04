const opcua = require("node-opcua");
const async = require("async");

let client = new opcua.OPCUAClient();

class OpcHelper {
  constructor(endPoint){
    this.endPoint = endPoint;
  }

  connect(callback){
    client.connect(this.endPoint,function (err) {
      if(err) {
          console.log(" cannot connect to endpoint :" , this.endPoint );
      } else {
          console.log("connected !");
      }
      callback(err);
    });
  }

  createSession(callback){
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
    console.log("getting root "+rootNode+" ->"+childName);
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

  createSubscription(callback){
    this.subscription = new opcua.ClientSubscription(this.session,{
        requestedPublishingInterval: 1000,
        requestedLifetimeCount:1000,
        requestedMaxKeepAliveCount: 1000,
        maxNotificationsPerPublish: 10,
        priority: 1
    });
    this.subscription.on("started",function(){
        console.log("subscription started");
    }).on("terminated",function(){
        callback();
    });

    setTimeout(function(){
        this.subscription.terminate();
    }.bind(this),50000);
  }

  monitorNode(nodeId){
    console.log(nodeId);
    console.log(this.subscription);
    return this.subscription.monitor({
        nodeId: nodeId,
        attributeId: opcua.AttributeIds.Value,
    },
    {
        clientHandle:13,
        samplingInterval: 1000,
        discardOldest: true,
        queueSize: 10
    },
    opcua.read_service.TimestampsToReturn.Neither
    );
  }

  closeSession(callback){
    this.session.close(function(err){
        if(err) {
            console.log("session closed failed ?");
        }
        callback(err);
    });
  }

  DoProcess(tasks){
    let asyncCom=tasks;
    if(!this.session){
      asyncCom = [
        function(callback){
          console.log("connect");
          this.connect(callback);
        }.bind(this),
        function(callback){
          console.log("session");
          this.createSession(callback);
        }.bind(this),
      ].concat(tasks);
    }

    asyncCom.push(
      function(callback){
        this.closeSession(callback);
      }.bind(this)
    );
    async.series(asyncCom,
      function(err) {
        if (err) {
            console.log(" failure ",err);
        } else {
            console.log("done!");
        }
        client.disconnect(function(){});
      }
    );
  }
}

module.exports = OpcHelper;
