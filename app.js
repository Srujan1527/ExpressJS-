const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB error ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const returnDbFromRequest = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const directorDbIntoResponseDb = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API -1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT 
        movie_name
        FROM 
        movie`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//API-2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
        INSERT INTO 
        movie(director_id,movie_name,lead_actor)
        VALUES (${directorId},'${movieName}','${leadActor}')`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API-3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieIdQuery = `
        SELECT * 
        FROM 
        movie
        WHERE 
        movie_id=${movieId}`;
  const movie = await db.get(getMovieIdQuery);
  response.send(returnDbFromRequest(movie));
});

//API -4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
        UPDATE movie
        SET 
            director_id=${directorId},
            movie_name='${movieName}',
            lead_actor='${leadActor}'
        WHERE
            movie_id=${movieId}`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//API-5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
//API-6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
        *
    FROM 
    director`;
  const getDirector = await db.all(getDirectorsQuery);
  response.send(
    getDirector.map((eachDirector) => directorDbIntoResponseDb(eachDirector))
  );
});

//API-7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
