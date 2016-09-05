
class monitoredItem{
  constructor(node,options){
    this.node=node;
    this.options=options; //TODO: specify options.
    this.Value=0;
    this.events={
      terminated:[],
      initialized:[],
      changed:[]
    };
    setTimeout(function(){
      this.emit('initialized');
    }.bind(this),0);
  }

  updateValue(value){
    if(value!=this.Value){
      this.Value=value;
      this.emit('changed',value);
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
}

module.exports = monitoredItem;
