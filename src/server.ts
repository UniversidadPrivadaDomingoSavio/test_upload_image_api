import express from "express";
import cors from "cors";
import { pool } from "./config/db";
import multer from "multer";

const app = express();
const PORT = 4000;
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

/*
let storebudget = 500;

app.get("/api/budget", (_req, res) => {
  res.status(200).json({
    budget: storebudget,
  });
});
*/

app.post("/api/images", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No se recibió ninguna imagen",
      });
    }

    const { originalname, mimetype, buffer } = req.file;

    const result = await pool.query(
      `
        INSERT INTO images (name, mime_type, image_data)
        VALUES ($1, $2, $3)
        RETURNING id, name, mime_type, created_at
        `,
      [originalname, mimetype, buffer],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al guardar la imagen",
    });
  }
});

app.get("/api/images", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, mime_type, created_at
      FROM images
      ORDER BY created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener las imágenes",
    });
  }
});

// LISTAR TODAS LAS IMÁGENES
app.get("/api/images", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, mime_type, created_at
      FROM images
      ORDER BY created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener las imágenes",
    });
  }
});

// OBTENER UNA IMAGEN POR ID
app.get("/api/images/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT image_data, mime_type
      FROM images
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Imagen no encontrada",
      });
    }

    const image = result.rows[0];

    res.setHeader("Content-Type", image.mime_type);

    res.send(image.image_data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener la imagen",
    });
  }
});

// PROGRAMA ANTERIOR
app.get("/api/budget", async (_req, res) => {
  try {
    const result = await pool.query("SELECT amount FROM budgets WHERE id = 1");
    const budget = result.rows[0].amount;
    return res.status(200).json({
      message: "Budget obtenido correctamente",
      budget: budget,
    });
  } catch (error) {
    res.status(500).json({
      message: "Hubo un error en la base de datos",
    });
  }
});

/*
app.put("/api/budget", (req, res) => {
  const budget = req.body.budget;

  if (typeof budget !== "number" || budget <= 0) {
    return res.status(400).json({
      message: "Budget tiene que ser un numero y debe de ser mayor a 0",
    });
  }

  storebudget = budget;

  return res.status(200).json({
    message: "Budget guardado correctamente",
  });
});
*/
app.put("/api/budget", async (req, res) => {
  const budget = req.body.budget;
  if (typeof budget !== "number" || budget <= 0) {
    return res.status(400).json({
      message: "Budget tiene que ser un numero y debe de ser mayor a 0",
    });
  }

  try {
    await pool.query("UPDATE budgets SET amount = $1 WHERE budgets.id = $2", [
      budget,
      1,
    ]);

    res.json({
      message: "Budget actualizado correctamente",
      budget,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el budget",
    });
  }
});

/*
===================Prueba de conección con BD================
async function testDatabaseConnection() {
  try {
    const result = await pool.query("SELECT * FROM budgets");

    console.log("Conexión correcta con PostgreSQL");
    console.log(result.rows);
  } catch (caughtError) {
    console.error("Error al conectar con PostgreSQL:", caughtError);
  }
}

testDatabaseConnection();
*/
app.listen(PORT, () => {
  console.log(`API funcionando en http://localhost:${PORT}`);
});
