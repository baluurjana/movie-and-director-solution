const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const dbpath = path.join(__dirname, 'moviesData.db')

let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Db Error:${e.messge}`)
    process.exit(1)
  }
}

initializeDbAndServer()

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    `
  const moviesArray = await db.all(getMoviesQuery)
  response.send(moviesArray)
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieDetails = `
    SELECT
     *
    FROM
      movie
    WHERE
      movie_id = ${movieId};
  `
  const movieDetails = await db.get(getMovieDetails)
  response.send(convertDbObjectToResponseObject(movieDetails))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
    INSERT INTO
      movie(director_id, movie_name, lead_actor)
    VALUES
      (${directorId},'${movieName}','${leadActor}');
  `
  await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE
      movie_id = ${movieId};
  `
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovie = `
    DELETE
    FROM
      movie
    WHERE
      movie_id = ${movieId};
  `
  await db.run(deleteMovie)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const {directorId} = request.params
  const directorDetails = `
    SELECT
      * 
    FROM 
      director;`
  const directDetails = await db.all(directorDetails)
  response.send(
    directDetails.map(eachDirector =>
      covertDirectorObjectToResponseObject(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectordetails = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id = ${directorId};
  `
  const directorDetails = await db.all(getDirectordetails)
  response.send(
    directorDetails.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

