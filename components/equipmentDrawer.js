const bsn = require("bootstrap.native");

class EqDrawer{
  constructor(element){
    this.element = element;
    this.modal = new bsn.Modal(element);
    this.element.addEventListener('shown.bs.modal',(e)=>{
      this.afterOpen();
    });
    this.element.addEventListener('hide.bs.modal',(e)=>{
      this.beforeColse();
    });
  }
  afterOpen(){
    for(var i=0;i<this.vars.length;i++){
      this.vars[i].subscribe(this.subIds[i],(newValue)=>{
        this.element.querySelector(`#detail-${this.vars[i].sName}`).innerHTML=Math.round(newValue*100)/100;
      });
    }
  }
  beforeColse(){
    for(var i=0;i<this.vars.length;i++){
      this.vars[i].unsubscribe(this.subIds[i])
    }
    this.vars=[];
    this.subIds=[];
  }
  draw(eq){
    let TAG = {main:`
      <div class='row'>
        <div class='col-xs-6 var-table'>
          <div class='row'>
            <div class='col-xs-5'>variable</div>
            <div class='col-xs-3'>unit</div>
            <div class='col-xs-4'>value</div>
          </div>
          {$content}
        </div>
        <div class='col-xs-6 var-chart'>
        </div>
      </div
    `
    };
    let content='';
    this.vars = eq.nodesToMonitor[i];
    for(var i=0;i<eq.nodesToMonitor.length;i++){
      content += `<div class='row'>
            <div class='col-xs-5'>${eq.nodesToMonitor[i].name}</div>
            <div class='col-xs-3'></div>
            <div class='col-xs-4' id='detail-${eq.nodesToMonitor[i].sName}'>0</div>
          </div>
          `;
    }
    let res = TAG.main.replace(/\{\$content}/gi,content);
    this.element.querySelector('.modal-body').innerHTML = res;
    this.modal.open();
  }
}

module.exports = EqDrawer;
