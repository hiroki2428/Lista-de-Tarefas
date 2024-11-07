import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TarefasList.css";

function TarefasList() {
  const [tarefas, setTarefas] = useState([]);
  const [showModal, setShowModal] = useState(false); // Modal de adicionar tarefa
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal de confirmação de exclusão
  const [showEditModal, setShowEditModal] = useState(false); // Modal de edição
  const [newTarefa, setNewTarefa] = useState({
    nome: "",
    custo: 0,
    dataLimite: "",
  });
  const [tarefaIdToDelete, setTarefaIdToDelete] = useState(null); // ID da tarefa a ser excluída
  const [tarefaToEdit, setTarefaToEdit] = useState(null); // Tarefa a ser editada

  useEffect(() => {
    async function fetchTarefas() {
      try {
        const response = await axios.get("http://127.0.0.1:3000/api/tarefas");
        setTarefas(response.data);
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
      }
    }
    fetchTarefas();
  }, []);

  const handleAddTarefa = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/tarefas",
        newTarefa
      );

      const updatedTarefas = await axios.get("http://127.0.0.1:3000/api/tarefas");
      setTarefas(updatedTarefas.data);

      setShowModal(false);
      setNewTarefa({ nome: "", custo: 0, dataLimite: "" });
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const handleEdit = (tarefa) => {
    setTarefaToEdit(tarefa); // Define tarefa que será editada
    setNewTarefa({
      nome: tarefa.nome,
      custo: tarefa.custo,
      dataLimite: tarefa.dataLimite,
    }); // Preenche o formulário com os dados da tarefa
    setShowEditModal(true); // Exibe o modal de edição
  };

  const handleEditTarefa = async () => {
    if (!tarefaToEdit) {
      console.error("Tarefa não selecionada para edição.");
      return;
    }

    try {
      const updatedTarefa = { ...tarefaToEdit, ...newTarefa };

      // Atualiza a tarefa via API
      const response = await axios.put(
        `http://127.0.0.1:3000/api/tarefas/${tarefaToEdit._id}`,
        updatedTarefa
      );

      // Recarrega a lista de tarefas após a edição
      const updatedTarefas = await axios.get("http://127.0.0.1:3000/api/tarefas");
      setTarefas(updatedTarefas.data);

      setShowEditModal(false); // Fecha o modal de edição
      setTarefaToEdit(null); // Limpa a tarefa em edição
      setNewTarefa({ nome: "", custo: 0, dataLimite: "" }); // Limpa o formulário
    } catch (error) {
      console.error("Erro ao editar tarefa:", error);
    }
  };

  const handleDelete = (id) => {
    setTarefaIdToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!tarefaIdToDelete) return;
    try {
      await axios.delete(`http://127.0.0.1:3000/api/tarefas/${tarefaIdToDelete}`);
      setTarefas((prevTarefas) =>
        prevTarefas.filter((tarefa) => tarefa._id !== tarefaIdToDelete)
      );
      setShowConfirmModal(false);
      setTarefaIdToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      setShowConfirmModal(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setTarefaIdToDelete(null);
  };

  const moveUp = async (id, index) => {
    if (index === 0) return; // Não pode subir se for a primeira tarefa

    try {
        await axios.put(`http://127.0.0.1:3000/api/tarefas/${id}/moveUp`);
        const updatedTarefas = await axios.get("http://127.0.0.1:3000/api/tarefas");
        setTarefas(updatedTarefas.data);
    } catch (error) {
        console.error("Erro ao mover tarefa para cima:", error);
    }
};

const moveDown = async (id, index) => {
    if (index === tarefas.length - 1) return; // Não pode descer se for a última tarefa

    try {
        await axios.put(`http://127.0.0.1:3000/api/tarefas/${id}/moveDown`);
        const updatedTarefas = await axios.get("http://127.0.0.1:3000/api/tarefas");
        setTarefas(updatedTarefas.data);
    } catch (error) {
        console.error("Erro ao mover tarefa para baixo:", error);
    }
};



return (
    <div className="container">
      <div className="table">
        <div className="table-header">
          <div className="table-cell">Nome da Tarefa</div>
          <div className="table-cell">Custo</div>
          <div className="table-cell">Data Limite</div>
          <div className="table-cell">Ações</div>
        </div>
        {tarefas.map((tarefa, index) => (
          <div
            key={tarefa._id || index}
            className={`table-row ${tarefa.custo >= 1000 ? "highlight" : ""}`}
          >
            <div className="table-cell">{tarefa.nome}</div>
            <div className="table-cell">R${tarefa.custo}</div>
            <div className="table-cell">{tarefa.dataLimite}</div>
            <div className="table-cell">
              <button onClick={() => handleEdit(tarefa)}>✏️</button>
              <button onClick={() => handleDelete(tarefa._id)}>🗑️</button>
              <button 
                onClick={() => moveUp(tarefa._id, index)} 
                disabled={index === 0} // Desativa se for a primeira tarefa
              >
                ⬆️
              </button>
              <button 
                onClick={() => moveDown(tarefa._id, index)} 
                disabled={index === tarefas.length - 1} // Desativa se for a última tarefa
              >
                ⬇️
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowModal(true)} className="add-task-button">
        Adicionar Tarefa
      </button>

      {/* Modal de Adição de Tarefa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nova Tarefa</h2>
            <input
              type="text"
              placeholder="Nome da Tarefa"
              value={newTarefa.nome}
              onChange={(e) =>
                setNewTarefa({ ...newTarefa, nome: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Custo"
              value={newTarefa.custo}
              onChange={(e) =>
                setNewTarefa({ ...newTarefa, custo: e.target.value })
              }
            />
            <input
              type="date"
              value={newTarefa.dataLimite}
              onChange={(e) =>
                setNewTarefa({ ...newTarefa, dataLimite: e.target.value })
              }
            />
            <button onClick={handleAddTarefa}>Salvar</button>
            <button onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal de Edição de Tarefa */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar Tarefa</h2>
            <input
              type="text"
              placeholder="Nome da Tarefa"
              value={newTarefa.nome}
              onChange={(e) =>
                setNewTarefa({ ...newTarefa, nome: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Custo"
              value={newTarefa.custo}
              onChange={(e) =>
                setNewTarefa({ ...newTarefa, custo: e.target.value })
              }
            />
            <input
              type="date"
              value={newTarefa.dataLimite}
              onChange={(e) =>
                setNewTarefa({ ...newTarefa, dataLimite: e.target.value })
              }
            />
            <button onClick={handleEditTarefa}>Salvar Edição</button>
            <button onClick={() => setShowEditModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Tem certeza que deseja excluir esta tarefa?</h3>
            <div>
              <button onClick={confirmDelete}>Sim</button>
              <button onClick={cancelDelete}>Não</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TarefasList;
