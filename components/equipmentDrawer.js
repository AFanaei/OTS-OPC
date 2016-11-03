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
    this.subIds=[];
    this.vars=[];
  }
  // we should add this events to the bootstrap.native project manually.
  afterOpen(){
    for(var i=0;i<this.vars.length;i++){
      let elem = this.element.querySelector(`#detail-${this.vars[i].sName}`);
      this.subIds[i] = this.vars[i].subscribe(function(elem,newValue){
         elem.querySelector(`.var-value`).value=Math.round(newValue*100)/100;
      }.bind(this,elem));
      elem.addEventListener('click',function(variable){
        this.showChart(variable)
      }.bind(this,this.vars[i]));
    }
  }
  beforeColse(){
    for(var i=0;i<this.vars.length;i++){
      this.vars[i].unsubscribe(this.subIds[i])
    }
    this.vars=[];
    this.subIds=[];
  }
  showChart(variable){
    console.log(`${variable.name} is drawing`);
  }
  draw(eq){
    let TAG = {main:`
      <div class='row'>
        <div class='col-xs-6 var-table'>
          <div class='row row-var'>
            <div class='col-xs-5'>variable</div>
            <div class='col-xs-3 text-center'>unit</div>
            <div class='col-xs-4 text-center'>value</div>
          </div>
          {$content}
        </div>
        <div class='col-xs-6 var-chart'>
        </div>
      </div
    `
    };
    let content='';
    this.vars = eq.nodesToMonitor;
    for(var i=0;i<eq.nodesToMonitor.length;i++){
      let enabled = eq.nodesToMonitor[i].options.editable?'enabled':'disabled';
      content += `<div class='row row-var' id='detail-${eq.nodesToMonitor[i].sName}'>
            <div class='col-xs-5'>${eq.nodesToMonitor[i].name}</div>
            <div class='col-xs-3 text-center'>${eq.nodesToMonitor[i].options.unit}</div>
            <div class='col-xs-4 text-center'>
              <label class="sr-only" for="var-value-${i}">Email address</label>
              <input type="text" class="form-control var-value input-sm" id="var-value-${i}" ${enabled}>
            </div>
          </div>
          `;
    }
    let res = TAG.main.replace(/\{\$content}/gi,content);
    this.element.querySelector('.modal-body').innerHTML = res;
    this.modal.open();
  }
}

module.exports = EqDrawer;
