const EqSaver = require("./eqSaver");
const Equipment = require("./equipment");

class EqManager{
  constructor(){
    this.eqList=[];
    this.layout=[];
  }
  loadFromFile(address, helper,callback){
    EqSaver.loadData(address,function(data){
      this.eqList = data.equipments.map(function(value,index){
        return new Equipment(value.id, value.options, helper, value.nodes);
      })
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
      let variable = v.eq.getVariableById(v.data.sName);
      return `
      <div id="id-${v.id}" class="equipment" style="left: ${v.pos.l}px; top: ${v.pos.t}px; width: ${v.pos.w}px; height: ${v.pos.h}px;">
        <div class="eq-name">${variable.name}</div>
        <div class="eq-value"></div>
      </div>`;
    });
    return arr.reduce((a,b)=>{
      return a + b;
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

module.exports = EqManager;
