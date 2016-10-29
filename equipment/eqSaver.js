const fs = require('fs');

class EqSaver{
  static loadData(fileAddress, callback){
    console.log(fileAddress);
    fs.readFile(fileAddress, 'utf8', function (err, data) {
      if (err) throw err;
      callback(JSON.parse(data));
    });
  }
  static saveData(equipments,fileAddress,callback){
    fs.writeFile(fileAddress, JSON.stringify(equipments), function(err) {
      if(err && callback) {
          callback(err);
      }
      if(callback) callback();
    });
  }
}

module.exports = EqSaver;
