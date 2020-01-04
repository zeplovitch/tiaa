'use strict'
const fs = require('fs');
const sourceFile='source.json';
const targetFile='target.json';

class ModelTargetBuilder {
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
        const modelTargetBuilder = new ModelTargetBuilder(
                                        currentName,
                                        currentTarget,
                                        priorName,
                                        priorTarget, 
                                        ModelTargetBuilder.lastID,
                                        parentId,
                                        modelType);
        ModelTargetBuilder.modelTargetArr.push(modelTargetBuilder);
        const lastId= ModelTargetBuilder.lastID;
        ModelTargetBuilder.lastID++;
        if(modelT && modelT.modelTargets  ) {
            for(const mt of modelT.modelTargets) {
              ModelTargetBuilder.addModelTarget(mt,lastId);
            }};
        }

      // sets the changed property to true and cslls 
      // recurssively  to the parent to do the same

    static setChecked(parentId){
        const target = ModelTargetBuilder.modelTargetArr.find(t => t.parentId === parentId);
        target.changed = true;
        if (target.parentId && !target.changed){
            ModelTargetBuilder.setChecked(target.parentId);
        }
    }
}

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
              ModelTargetBuilder.modelTargetArr = []; 

              // initialize  id 
              ModelTargetBuilder.lastID = 2

              // call the builder with root ModelTargets
              for(let modelT of source.modelTargets){
                ModelTargetBuilder.addModelTarget(modelT);
              };

              // traverse up all changed =true and update parent
               for (let t of ModelTargetBuilder.modelTargetArr.filter(arr => arr.changed)){
                 ModelTargetBuilder.setChecked(t.parentId);
               }

               // write the file 
              fs.writeFile(targetFile, JSON.stringify(ModelTargetBuilder.modelTargetArr),err => {
                console.log('done')
              });
          }
    });
}

main();