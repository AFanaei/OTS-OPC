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
      }(i)));
    }
  }

  getChildrenNode(rootNode,childName,Next,callback){
    if(Next.length==0){
      console.log("result "+rootNode);
      callback(rootNode);
      return;
    }
    console.log("getting root "+rootNode+" ->"+childName);
    this.session.browse(rootNode, function(err,browse_result){
      if(!err) {
        for(let i=0;i<browse_result[0].references.length;i++){
          let item = browse_result[0].references[i];
          if(item.displayName.text == childName){
            let newChildName = Next.shift();
            console.log(item.displayName.text);
            this.getChildrenNode(item.nodeId,newChildName,Next,callback);
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
          console.log(" free mem % = " , dataValue.toString());
      }
      callback(err);
    });
  }

  closeSession(){
    this.session.close(function(err){
        if(err) {
            console.log("session closed failed ?");
        }
        callback(err);
    });
  }

  DoProcess(callback){
    var ref = this;
    async.series([
      function(callback){
        console.log("connect");
        ref.connect(callback);
      },
      function(callback){
        console.log("session");
        ref.createSession(callback);
      },
      function(callback){
        console.log("root folder....");
        ref.getNodeIdByPath("RootFolder",["Objects/Infoplus/"],function(res){
          if(res[0].error){
            callback(res[0].error);
          }else{
            ref.node=res[0];
            callback();
          }
        });
      },
      function(callback){
        ref.readValue(ref.node,callback);
      },
      function(callback){
        ref.closeSession(callback);
      }
    ],
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
