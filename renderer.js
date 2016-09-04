const OpcHelper = require("./opcHelper");

let endpointUrl = "opc.tcp://" + require("os").hostname() + ":21381/MatrikonOpcUaWrapper";

let helper = new OpcHelper(endpointUrl);
console.log("salam");
helper.DoProcess();

//async.series([
    // step 5: install a subscription and install a monitored item for 10 seconds
    /*
    function(callback) {
       the_subscription=new opcua.ClientSubscription(the_session,{
           requestedPublishingInterval: 1000,
           requestedLifetimeCount: 10,
           requestedMaxKeepAliveCount: 2,
           maxNotificationsPerPublish: 10,
           publishingEnabled: true,
           priority: 10
       });
       the_subscription.on("started",function(){
           console.log("subscription started for 2 seconds - subscriptionId=",the_subscription.subscriptionId);
       }).on("keepalive",function(){
           console.log("keepalive");
       }).on("terminated",function(){
           callback();
       });

       setTimeout(function(){
           the_subscription.terminate();
       },50000);

       // install monitored item
       var monitoredItem  = the_subscription.monitor({
           nodeId: opcua.resolveNodeId("ns=7;s=A1113A"),
           attributeId: opcua.AttributeIds.Value
       },
       {
           samplingInterval: 100,
           discardOldest: true,
           queueSize: 10
       },
       opcua.read_service.TimestampsToReturn.Both
       );

       console.log("-------------------------------------");
       monitoredItem.on("changed",function(dataValue){
          console.log(dataValue.value.value);
       });
    },
    */
    // close session

// ],
//
// function(err) {
//     if (err) {
//         console.log(" failure ",err);
//     } else {
//         console.log("done!");
//     }
//     client.disconnect(function(){});
// }) ;
