const EqSaver = require("./eqSaver");
const Equipment = require("./equipment");

class EqManager{
  constructor(){
    this.timer=null; //variable of timer
    this.eqList=[];
    this.layout=[];
  }
  loadFromFile(address, helper,callback){
    EqSaver.loadData(address,function(data){
      this.eqList = data.equipments.map((value,index)=>{
        if(value.options.type=='timer'){
          let eqq =new Equipment(value.id, value.options, helper,null, value.nodes);
          this.timer = eqq.nodesToMonitor[0];
          return eqq;
        }
        return new Equipment(value.id, value.options, helper,this.timer, value.nodes);
      });
      this.layout = data.layout.map((v,i)=>{
        v['eq']= this.eqList[this.eqList.findIndex((x)=>{
          return x.id==v.id;
        })];
        return v;
      });
      if(callback) callback();
    }.bind(this));
  }
  renderLayout(){
    let arr = this.layout.map((v,i)=>{
      let variable = {name:v.eq.options.name,sName:-1};
      if(v.data){
        variable = v.eq.getVariableById(v.data.sName);
      }
      return {tag:`
      <div id="id-${v.id}" class="equipment" style="left: ${v.pos.l}px; top: ${v.pos.t}px; width: ${v.pos.w}px; height: ${v.pos.h}px;">
        <div class="eq-name">${variable.name}</div>
        <div class="eq-value" id="sName-${variable.sName}"></div>
      </div>`,variable:[variable]};
    });
    return arr.reduce((a,b)=>{
      return {tag:a.tag + b.tag,variable:a.variable.concat(b.variable)};
    });
  }
  saveToFile(address){
    EqSaver.saveData({version:"1",equipments:this.eqList.map(function(value,index){ return value.serialize()})},address);
  }
  addEquipment(equipment){
    this.eqList.push(equipment);
  }
  startMonitoring(){
    this.eqList.forEach(function(item){
      item.startMonitoring();
    })
  }
}
let eqManager = new EqManager();
module.exports = eqManager;
