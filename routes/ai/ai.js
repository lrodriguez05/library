const OpenAI = require("openai");
const express = require("express");
const router = express.Router();
const Biblioteca = require("../../class.js");
const bookCatalog = new Biblioteca("Jose Marti");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { message } = req.body;
  const host = req.headers["origin"];
  const libros = await bookCatalog.verLibros();
  const librosNames = libros
    .map((item) => `ID: ${item.id}, Titulo: ${item.titulo}`)
    .join(", ");

  const SYSTEM_PROMPT = `Eres un asistente de inteligencia artificial de la biblioteca "Jose Marti",
   disenado para ayudar a las personas a obtener informacion sobre los libros de la biblioteca y tratar temas solo relacionados a la biblioteca. Proporciona respuestas claras y concisas,
    y siempre mantente enfocado en el contexto de la biblioteca. Si una pregunta no esta relacionada con la biblioteca, responde educadamente que no puedes ayudar con esa consulta.
    Este es el catalogo de libros disponibles en la biblioteca: ${librosNames}, si alguien te pregunta por un libro y lo encuentras en tu catalogo, proporciona un enlace usando este formato: ${host}/libros/detalles/{ID_DEL_LIBRO_EN_CATALOGO}. Se flexible con los libros si alguien te lo dice con falta de ortografia o mal escrito el nombre busca nombres similares en el catalogo aunque tambien tengan mal el nombre en el catalogo.
    
`;

  try {
    if (!message) {
      return res.status(400).json({ message: "Faltan campos por rellenar" });
    }
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      store: true,
    });
    console.log(response.output_text);
    res.status(200).json({ message: response.output_text });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      err: err.message,
    });
  }
});

module.exports = router;
