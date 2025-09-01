const express = require("express");
const Biblioteca = require("../../class");
const router = express.Router();

const biblioteca = new Biblioteca("Jose Marti");

router.post("/libros", async (req, res) => {
  const { titulo, autor, sede_id } = req.body;

  if (!titulo || !autor || !sede_id) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }
  try {
    const libroId = await biblioteca.agregarLibro(titulo, autor, sede_id);
    res.status(201).json({ message: `Libro agregado`, id: libroId });
  } catch (err) {
    res.status(500).json({ message: "Error al agregar el libro", id: libroId });
  }
});

router.get("/libros", async (req, res) => {
  try {
    const libros = await biblioteca.verLibros();
    res.status(200).json({ message: `Libros en la biblioteca`, libros });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el listado de libros" });
  }
});

router.post("/libros/prestar", async (req, res) => {
  const { id } = req.body;
  try {
    const libro = await biblioteca.prestarLibro(id);
    res.status(201).json({ message: `Libro prestado`, libro });
  } catch (err) {
    if (err.message === "No se ha encontrado el libro solicitado") {
      return res.status(400).json({ message: "Libro no encontrado" });
    }
    if (err.message === "Ese libro ya se encuentra prestado") {
      return res
        .status(400)
        .json({ message: "El libro solicitado ya esta prestado :)" });
    }
    res.status(500).json(`Ocurrio un error al prestar el libro: `, err.message);
  }
});

router.post("/libros/devolver", async (req, res) => {
  const { id } = req.body;
  try {
    const libro = await biblioteca.devolverLibro(id);
    res.status(201).json({ message: `Libro devuelto`, libro });
  } catch (err) {
    if (err.message === "No se ha encontrado el libro") {
      return res.status(400).json({ message: "Libro no encontrado" });
    }
    if (err.message === "Ese libro ya se encuentra disponible") {
      return res
        .status(400)
        .json({ message: "El libro solicitado ya esta disponible" });
    }
    res
      .status(500)
      .json(`Ocurrio un error al devolver el libro: `, err.message);
  }
});

router.get("/libros/id", async (req, res) => {
  const { id } = req.body;
  try {
    const libro = await biblioteca.porId(id);
    res.status(201).json({ message: `Libro encontrado`, libro });
  } catch (err) {
    if (err.message === "Libro no encontrado") {
      return res.status(400).json({ message: "Libro no encontrado" });
    }
    res.status(500).json({
      message: "Ocurrio un error al obtener el libro",
      error: err.message,
    });
  }
});
router.get("/libros/idSede", async (req, res) => {
  const { id } = req.body;
  try {
    const libros = await biblioteca.porSede(id);
    res.status(201).json({ message: `Libros en la sede ${id}`, libros });
  } catch (err) {
    res.status(500).json({
      message: "Ocurrio un error al obtener la sede",
      error: err.message,
    });
  }
});

router.delete("/libros", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }
  try {
    const deleteId = await biblioteca.eliminarLibro(id);
    res.status(201).json({ message: "El libro ha sido eliminado", deleteId });
  } catch (err) {
    if (err.message === "Libro no encontrado") {
      return res.status(400).json({ message: "Libro no encontrado" });
    }
    res.status(500).json({
      message: "Ocurrio un error al eliminar el libro",
      error: err.message,
    });
  }
});

module.exports = router;
