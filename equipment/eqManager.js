const EqSaver = require("./eqSaver");
const Equipment = require("./equipment");

class EqManager{
  constructor(){
    this.eqList=[];
  }
  loadFromFile(address, helper,callback){
    EqSaver.loadData(address,function(data){
      this.eqList = data.equipments.map(function(value,index){
        return new Equipment(value.id, value.options, helper, value.nodes);
      })
      if(callback) callback();
    }.bind(this));
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
