const express = require("express");
const router = express.Router();
const Biblioteca = require("../../class.js");
const bookCatalog = new Biblioteca("Jose Marti");
const Gpt = require("./ai_class.js");
const openai = new Gpt();

router.post("/", async (req, res) => {
  const { message } = req.body;
  const host = req.headers["origin"];
  const libros = await bookCatalog.verLibros();
  const librosNames = libros
    .map((item) => `ID: ${item.id}, Titulo: ${item.titulo}`)
    .join(", ");

  try {
    if (!message) {
      return res.status(400).json({ message: "Faltan campos por rellenar" });
    }

    const response = await openai.sendMessage(message, host, librosNames);
    res.status(200).json({ message: response.output_text });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      err: err.message,
    });
  }
});

router.post("/stream-cerebras", async (req, res) => {
  const { message } = req.body;
  const host = req.headers["origin"];
  const libros = await bookCatalog.verLibros();
  const librosNames = libros
    .map((item) => `ID: ${item.id}, Titulo: ${item.titulo}`)
    .join(", ");

  if (!message) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.generateResponseCerebrasStream(
      message,
      librosNames,
      host,
    );

    for await (const delta of stream) {
      res.write(`data: ${delta}\n\n`);
    }

    res.end();
  } catch (err) {
    res.write(`event: error\ndata: ${err.message}\n\n`);
    res.end();
  }
});

router.post("/stream", async (req, res) => {
  const { message } = req.body;
  const host = req.headers["origin"];
  const libros = await bookCatalog.verLibros();
  const librosNames = libros
    .map((item) => `ID: ${item.id}, Titulo: ${item.titulo}`)
    .join(", ");

  if (!message) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.generateResponseStream(
      message,
      librosNames,
      host,
    );

    for await (const delta of stream) {
      res.write(`data: ${delta}\n\n`);
    }

    res.write("event: end\ndata: FIN\n\n");
    res.end();
  } catch (err) {
    res.write(`event: error\ndata: ${err.message}\n\n`);
    res.end();
  }
});

module.exports = router;
