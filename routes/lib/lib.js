const express = require("express");
const router = express.Router();

const libros = require("./libros");
const sedes = require("./sedes");
const resenas = require("./resenas");
const prestados = require("./prestados");

router.use("/", libros);
router.use("/", sedes);
router.use("/", prestados);
router.use("/", resenas);

module.exports = router;
