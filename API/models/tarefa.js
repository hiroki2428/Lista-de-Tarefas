const mongoose = require("mongoose")

const {Schema} = mongoose;

const tarefaSchema = new Schema({
    nome:{
        type:String,
        required:true,
        unique:true
    },
    custo:{
        type:Number,
        required:true,
    },
    dataLimite:{
        type:Date,
        required:true,
    },
    ordemApresentacao:{
        type:Number
    }
},
{timestamps : true}
);


tarefaSchema.pre('save', async function(next) {
    if (this.isNew) {
        const ultimoRegistro = await this.constructor.findOne().sort({ ordemApresentacao: -1 });
        this.ordemApresentacao = ultimoRegistro ? ultimoRegistro.ordemApresentacao + 1 : 1;
    }
    next();
});

const tarefa = mongoose.model("Tarefa",tarefaSchema);
module.exports = {
    tarefa,
    tarefaSchema
}