const router = require("express").Router()

const tarefasRouter = require("./tarefas")

router.use("/",tarefasRouter)

module.exports = router;