const express = require("express");
const Biblioteca = require("../../class");
const router = express.Router();

const biblioteca = new Biblioteca("Jose Marti");

router.get("/prestados", async (req, res) => {
  try {
    const prestados = await biblioteca.listaPrestamos();
    res.status(200).json({ message: `Libros prestados`, prestados });
    console.log(prestados);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener el listado de libros prestados" });
  }
});

router.get("/prestados/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const prestados = await biblioteca.listaPrestamosUsuario(userId);
    res.status(200).json({ message: `Libros prestados`, prestados });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener el listado de libros prestados" });
  }
});

router.post("/prestados/registrar", async (req, res) => {
  const { id_libro, usuario, fecha_devolucion } = req.body;

  if (!id_libro || !usuario || !fecha_devolucion) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }
  try {
    const prestamoId = await biblioteca.registrarPrestamo(
      id_libro,
      usuario,
      fecha_devolucion
    );
    res
      .status(201)
      .json({ message: "Prestamo registrado exitosamente", id: prestamoId });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el prestamo" });
  }
});

router.patch("/prestados/devolver/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const prestamo = await biblioteca.devolverPrestamo(id);
    res.status(201).json({ message: `Prestamo devuelto`, prestamo });
  } catch (err) {
    if (err.message === "No se ha encontrado el prestamo") {
      return res.status(400).json({ message: "Prestamo no encontrado" });
    }
    res
      .status(500)
      .json(`Ocurrio un error al devolver el prestamo: `, err.message);
  }
});

module.exports = router;
