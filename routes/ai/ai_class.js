const OpenAI = require("openai");
const Cerebras = require("@cerebras/cerebras_cloud_sdk");

class Gpt {
  constructor() {
    this.chatgpt = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.cerebras = new Cerebras({
      apiKey: process.env.CEREBRAS_API_KEY,
    });
  }

  async contextGeneration(librosNames, host) {
    return `Eres un asistente de inteligencia artificial de la biblioteca "Jose Marti",
   disenado para ayudar a las personas a obtener informacion sobre los libros de la biblioteca y tratar temas solo relacionados a la biblioteca. Proporciona respuestas claras y concisas,
    y siempre mantente enfocado en el contexto de la biblioteca. Si una pregunta no esta relacionada con la biblioteca, responde educadamente que no puedes ayudar con esa consulta.
    Este es el catalogo de libros disponibles en la biblioteca: ${librosNames}, si alguien te pregunta por un libro y lo encuentras en tu catalogo, proporciona un enlace usando este formato: ${host}/libros/detalles/{ID_DEL_LIBRO_EN_CATALOGO}. Se flexible con los libros si alguien te lo dice con falta de ortografia o mal escrito el nombre busca nombres similares en el catalogo aunque tambien tengan mal el nombre en el catalogo.
    
`;
  }

  async generateResponseCerebrasStream(prompt, librosNames, host) {
    const SYSTEM_PROMPT = await this.contextGeneration(librosNames, host);
    const stream = await this.cerebras.chat.completions.create({
      model: "gpt-oss-120b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      stream: true,
    });

    return (async function* () {
      for await (const chunk of stream) {
        yield chunk.choices[0]?.delta?.content || "";
      }
    })();
  }

  async generateResponseStream(prompt, librosNames, host) {
    const SYSTEM_PROMPT = `Eres un asistente de inteligencia artificial de la biblioteca "Jose Marti",
   disenado para ayudar a las personas a obtener informacion sobre los libros de la biblioteca y tratar temas solo relacionados a la biblioteca. Proporciona respuestas claras y concisas,
    y siempre mantente enfocado en el contexto de la biblioteca. Si una pregunta no esta relacionada con la biblioteca, responde educadamente que no puedes ayudar con esa consulta.
    Este es el catalogo de libros disponibles en la biblioteca: ${librosNames}, si alguien te pregunta por un libro y lo encuentras en tu catalogo, proporciona un enlace usando este formato: ${host}/libros/detalles/{ID_DEL_LIBRO_EN_CATALOGO}. Se flexible con los libros si alguien te lo dice con falta de ortografia o mal escrito el nombre busca nombres similares en el catalogo aunque tambien tengan mal el nombre en el catalogo.
    
`;
    const stream = await this.openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      stream: true,
    });

    return (async function* () {
      for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
          yield event.delta;
        }
      }
    })();
  }

  async sendMessage(message, host, librosNames) {
    const SYSTEM_PROMPT = `
Eres un asistente de inteligencia artificial de la biblioteca "José Martí".
Tu función es ayudar a las personas a obtener información sobre los libros disponibles en la biblioteca
y responder únicamente a temas relacionados con la biblioteca.

Proporciona respuestas claras, concisas y amables.
Si una pregunta no está relacionada con la biblioteca, responde educadamente que no puedes ayudar con esa consulta.

Este es el catálogo de libros disponibles en la biblioteca:
${librosNames}

Si alguien pregunta por un libro y lo encuentras en el catálogo, proporciona un enlace usando el siguiente formato:
${host}/libros/detalles/{ID_DEL_LIBRO_EN_CATALOGO}

Sé flexible con errores de ortografía o nombres mal escritos: intenta encontrar coincidencias similares en el catálogo,
pero nunca inventes libros que no existan en él.
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });
    return {
      output_text: response.choices[0].message.content,
    };
  }
}

module.exports = Gpt;

// class Agent {
//   chatgpt;
//   cerebras;

//   constructor() {}

//   async contextGeneration(host) {
//     const libros = await bookCatalog.verLibros();
//     const librosNames = libros
//       .map((item) => `ID: ${item.id}, Titulo: ${item.titulo}`)
//       .join(", ");
//     return `Eres un asistente de inteligencia artificial de la biblioteca "Jose Marti",
//    disenado para ayudar a las personas a obtener informacion sobre los libros de la biblioteca y tratar temas solo relacionados a la biblioteca. Proporciona respuestas claras y concisas,
//     y siempre mantente enfocado en el contexto de la biblioteca. Si una pregunta no esta relacionada con la biblioteca, responde educadamente que no puedes ayudar con esa consulta.
//     Este es el catalogo de libros disponibles en la biblioteca: ${librosNames}, si alguien te pregunta por un libro y lo encuentras en tu catalogo, proporciona un enlace usando este formato: ${host}/libros/detalles/{ID_DEL_LIBRO_EN_CATALOGO}. Se flexible con los libros si alguien te lo dice con falta de ortografia o mal escrito el nombre busca nombres similares en el catalogo aunque tambien tengan mal el nombre en el catalogo.
// `;
//   }
// }
