'use strict'
const fs = require('fs');
const sourceFile='source.json';
const targetFile='target.json';

class ModelTarget {
    constructor(currentName,
                currentTarget,
                priorName,
                priorTarget,
                id,
                parentId,
                modelType
                ) {
        this.currentName = currentName;
        this.currentTarget =  currentTarget;
        this.priorName =   priorName;
        this.priorTarget =  priorTarget;
        this.Id = id;
        this.parentId = parentId;
        this.modelType = modelType;
        this.changed = this.priorTarget !== this.currentTarget;
    }

    // this static method will create a new instance  
    // and will add to an array.


    static addModelTarget(modelT,parent){
        const currentName = modelT.currentName;
        const parentId = parent;
        const currentTarget =modelT.currentTarget;
        const priorName = modelT.priorName;
        const priorTarget = modelT.priorTarget;
        const modelType = modelT.modelType;
        const modelTarget = new ModelTarget(
                                        currentName,
                                        currentTarget,
                                        priorName,
                                        priorTarget, 
                                        ModelTarget.lastID,
                                        parentId,
                                        modelType);
        ModelTarget.modelTargetArr.push(modelTarget);
        // we save it so we can send parent
        const lastId = ModelTarget.lastID;
        // we mpw add one tp load id 
        ModelTarget.lastID++;
        if(modelT && modelT.modelTargets){
            for(const mt of modelT.modelTargets) {
              ModelTarget.addModelTarget(mt,lastId);
            }};
        }

      // sets the "changed" property to true and cslls 
      // recurssively  to the parent to do the same

    static setChecked(parentId){
        const target = ModelTarget.modelTargetArr.find(t => t.parentId === parentId);
        target.changed = true;
        if (target.parentId && !target.changed){
            ModelTarget.setChecked(target.parentId);
        }
    }
}
    // read function 
    
const read = (fileName,cb) => {
    fs.readFile(fileName, 'utf8', (err,data) => {
        if(err) {
            cb(err);
        } else {
            cb(null,data);
        }
})};

function main(){
    const res = [];
    // read source file
    read(sourceFile, (err,data) => {
          if(err) {
            console.log(err);
          } else {
              const source = JSON.parse(data);  

              // inirialize static array 
              ModelTarget.modelTargetArr = []; 

              // initialize  id 
              ModelTarget.lastID = 2

              // call the builder with root ModelTargets
              for(let modelT of source.modelTargets){
                ModelTarget.addModelTarget(modelT);
              };

              // traverse up all changed =true and update parent
               for (let t of ModelTarget.modelTargetArr.filter(arr => arr.changed)){
                 ModelTarget.setChecked(t.parentId);
               }

               // write the file 
              fs.writeFile(targetFile, JSON.stringify(ModelTarget.modelTargetArr),err => {
                console.log('done')
              });
          }
    });
}

main();