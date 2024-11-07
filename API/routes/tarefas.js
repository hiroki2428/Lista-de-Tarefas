const router = require("express").Router()

const tarefaController = require("../controllers/tarefaController");

router.route("/tarefas").post((req,res)=>tarefaController.create(req,res));
router.route("/tarefas").get((req,res)=>tarefaController.getAll(req,res));
router.route("/tarefas/:id").get((req, res) => tarefaController.get(req, res));
router.route("/tarefas/:id").put((req, res) => tarefaController.update(req, res));
router.route("/tarefas/:id").delete((req, res) => tarefaController.delete(req, res));
router.route("/tarefas/:id/moveUp").put((req, res) => tarefaController.moveUp(req, res));
router.route("/tarefas/:id/moveDown").put((req, res) => tarefaController.moveDown(req, res));


module.exports = router;