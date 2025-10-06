const express = require("express");
const router = express.Router();
const UserGestor = require("../../user-class");

const userGestor = new UserGestor();

router.get("/", async (req, res) => {
  try {
    const users = await userGestor.getAllUsers();
    res.status(200).json({ message: `Usuarios`, users });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error al obtener el listado de usuarios" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }
  try {
    const deleteId = await userGestor.deleteUser(id);
    res.status(201).json({ message: "El usuario ha sido eliminado", deleteId });
  } catch (err) {
    if (err.message === "Usuario no encontrado") {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }
    res.status(500).json({
      message: "Ocurrio un error al eliminar el usuario",
      error: err.message,
    });
  }
});

module.exports = router;
