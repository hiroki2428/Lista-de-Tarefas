const { tarefa: tarefaModel } = require("../models/tarefa");

const tarefaController = {
    create: async (req, res) => {
        try {
            const { nome, custo, dataLimite } = req.body;
        
            // Verificar se o nome já está cadastrado
            const tarefaExistente = await tarefaModel.findOne({ nome });
            if (tarefaExistente) {
                return res.status(400).json({ msg: "O nome da tarefa já existe!" });
            }
        
            // Converter a data de "dd/mm/aaaa" para o formato Date
            const [dia, mes, ano] = dataLimite.split("/");
            const dataFormatada = new Date(`${ano}-${mes}-${dia}`);
        
            // Validar se a dataLimite não é no passado
            const dataAtual = new Date();
            if (dataFormatada < dataAtual) {
                return res.status(400).json({ msg: "A data limite não pode ser no passado!" });
            }
        
            // Criar o objeto da tarefa
            const tarefa = {
                nome,
                custo,
                dataLimite: dataFormatada
            };
        
            const response = await tarefaModel.create(tarefa);
            response.dataLimite = formatDate(response.dataLimite); // Formatando a data para um formato legível
            res.status(201).json({ response, msg: "Tarefa Criada com Sucesso" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Erro ao criar a Tarefa!" });
        }
    },
    
    getAll: async (req, res) => {
        try {
          const tarefasList = await tarefaModel.find().sort({ ordemApresentacao: 1 });
      
          // Formata a data de cada tarefa
          const tarefasFormatadas = tarefasList.map(tarefa => ({
            ...tarefa._doc,
            dataLimite: formatDate(tarefa.dataLimite),
          }));
      
          res.json(tarefasFormatadas);
        } catch (error) {
          console.log(error);
          res.status(500).json({ msg: "Erro ao obter as Tarefas!" });
        }
      },

    get: async (req, res) => {
        try {
            const id = req.params.id;
            const tarefa = await tarefaModel.findById(id);

            if (!tarefa) {
                res.status(404).json({ msg: "Tarefa não encontrada" });
                return;
            }

            // Formatando a data da tarefa específica
            tarefa.dataLimite = formatDate(tarefa.dataLimite);
            res.json(tarefa);
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Erro ao obter a Tarefa!" });
        }
    },

    delete: async (req, res) => {
        try {
            const id = req.params.id;
            const tarefa = await tarefaModel.findById(id);

            if (!tarefa) {
                res.status(404).json({ msg: "Publicação não encontrada" });
                return;
            }

            const deletedTarefa = await tarefaModel.findByIdAndDelete(id);
            deletedTarefa.dataLimite = formatDate(deletedTarefa.dataLimite);
            res.status(200).json({ deletedTarefa, msg: "Tarefa deletada com sucesso" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Erro ao deletar a Tarefa!" });
        }
    },

    update: async (req, res) => {
        try {
            const id = req.params.id;
            const existingTarefa = await tarefaModel.findById(id);

            if (!existingTarefa) {
                return res.status(404).json({ msg: "Tarefa não encontrada" });
            }

            const { nome, custo, dataLimite } = req.body;
            const updatedData = dataLimite ? new Date(dataLimite.split("/").reverse().join("-")) : existingTarefa.dataLimite;

            const updatedTarefa = {
                nome: nome || existingTarefa.nome,
                custo: custo || existingTarefa.custo,
                dataLimite: updatedData,
            };

            const updateTarefa = await tarefaModel.findByIdAndUpdate(id, updatedTarefa, { new: true });

            updateTarefa.dataLimite = formatDate(updateTarefa.dataLimite);
            res.status(200).json({ updateTarefa, msg: "Tarefa Atualizada com sucesso" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Erro ao atualizar a Tarefa!" });
        }
    },
   // Função para mover a tarefa para cima
 moveUp : async (req, res) => {
    try {
        const { id } = req.params;
        const tarefa = await tarefaModel.findById(id);

        if (!tarefa) {
            return res.status(404).json({ msg: "Tarefa não encontrada" });
        }

        // Encontrar a tarefa diretamente acima (com a ordem de apresentação menor)
        const tarefaAcima = await tarefaModel.findOne({ 
            ordemApresentacao: tarefa.ordemApresentacao - 1 
        });

        if (!tarefaAcima) {
            return res.status(400).json({ msg: "A tarefa já está no topo da lista" });
        }

        // Trocar as ordens de apresentação
        [tarefa.ordemApresentacao, tarefaAcima.ordemApresentacao] = 
        [tarefaAcima.ordemApresentacao, tarefa.ordemApresentacao];

        // Salvar as alterações no banco
        await tarefa.save();
        await tarefaAcima.save();

        res.status(200).json({ msg: "Tarefa movida para cima com sucesso" });
    } catch (error) {
        console.error("Erro ao mover tarefa para cima:", error);
        res.status(500).json({ msg: "Erro ao mover tarefa para cima" });
    }
},

// Função para mover a tarefa para baixo
 moveDown : async (req, res) => {
    try {
        const { id } = req.params;
        const tarefa = await tarefaModel.findById(id);

        if (!tarefa) {
            return res.status(404).json({ msg: "Tarefa não encontrada" });
        }

        // Encontrar a tarefa diretamente abaixo (com a ordem de apresentação maior)
        const tarefaAbaixo = await tarefaModel.findOne({ 
            ordemApresentacao: tarefa.ordemApresentacao + 1 
        });

        if (!tarefaAbaixo) {
            return res.status(400).json({ msg: "A tarefa já está na última posição" });
        }

        // Trocar as ordens de apresentação
        [tarefa.ordemApresentacao, tarefaAbaixo.ordemApresentacao] = 
        [tarefaAbaixo.ordemApresentacao, tarefa.ordemApresentacao];

        // Salvar as alterações no banco
        await tarefa.save();
        await tarefaAbaixo.save();

        res.status(200).json({ msg: "Tarefa movida para baixo com sucesso" });
    } catch (error) {
        console.error("Erro ao mover tarefa para baixo:", error);
        res.status(500).json({ msg: "Erro ao mover tarefa para baixo" });
    }
},
};

// Função para formatar a data no padrão "dd/mm/aaaa"
function formatDate(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
};



module.exports = tarefaController;
