const express = require("express");
const router = express.Router();

const libros = require("./libros");
const sedes = require("./sedes");

router.use("/", libros);
router.use("/", sedes);

module.exports = router;
