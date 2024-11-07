const mongoose = require("mongoose")

async function main(params) {
    try {
        await mongoose.connect("mongodb+srv://hirokiasanovieira:1234@cluster0.fgli2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Banco Concectado");
    } catch (error) {
        console.log(`Erro: ${error}`);
    }
}

module.exports = main