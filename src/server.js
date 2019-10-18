import express from 'express';
// import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import CircularJSON from 'circular-json';
import http from 'http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4300;
app.listen(process.env.PORT || 4300);
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const API_URL = `https://api.themoviedb.org/discover/movie/`;
const OMDB_API_KEY = 'f95fb581';


app.get('/', (req, res, next) => {
    res.send("Movie Chatbot works");
})

const transformCircularJSON = (_response) => {
    return CircularJSON.stringify(_response)
}

const transformResponsetoList = (response) => {
   var output = `The top movies for kids are: `;
   for(var i=0; i<response.length; i++) {
       output += response[i].original_title;
       output+="\n"
   }
   return output;
}

app.post('/getMovie', (req, res) => {
    const movieToSearch =
		req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.movie
			? req.body.queryResult.parameters.movie
			: ''
    
    console.log("movie to search", movieToSearch);
    const reqUrl = encodeURI(
        `http://www.omdbapi.com/?t=${movieToSearch}&apikey=${OMDB_API_KEY}`);
    http.get(
        reqUrl,
        responseFromAPI => {
            let completeResponse = ''
            responseFromAPI.on('data', chunks => {
                completeResponse += chunks
            })
            responseFromAPI.on('end', () => {
                const movie = JSON.parse(completeResponse);
                let dataToSend = movieToSearch;

                dataToSend = `${movie.Title} was released in the year ${movie.Year}. It is directed by ${
					movie.Director
				} and stars ${movie.Actors}.\n Here some glimpse of the plot: ${movie.Plot}.
                }`
                
                return res.json({
					fulfillmentText: dataToSend,
					source: 'getMovie'
				})
            })
        },
        error => {
            return res.status(401).json({
                error: true,
                success: false,
                message: error.message,
                fulfillmentText: 'Could not get results at this time',
				source: 'getmovie'
            })
        }
    )
})

app.get('/movieForKids', async (req, res) => {
    let request_url = `https://api.themoviedb.org/3/discover/movie?api_key=c43584493dfea10989cdc04f99ffd285&certification_country=US&certification.lte=G&sort_by=popularity.desc`;
    try {
        let movies = await axios.get(request_url);
        if(movies) {
            let parsedMovies = JSON.parse(transformCircularJSON(movies)).data.results;
            return res.status(200).json({
                error: false,
                success: true,
                movies: parsedMovies.map((item) => { return item.original_title}),
                template: transformResponsetoList(parsedMovies),
                count: JSON.parse(transformCircularJSON(movies)).data.results.length,
                data: JSON.parse(transformCircularJSON(movies)).data.results,
                
            })
        }
    } catch (ex)  {
        // console.log("ex", ex)
        return res.status(400).json({
            error: true,
            success: false,
            message: ex.message
        })
    }
})

app.get('/getMovieDetails', (req, res, next) => {
    console.log("get movie details");
    let api_url = `https://api.themoviedb.org/3/movie/550?api_key=c43584493dfea10989cdc04f99ffd285`;
    return axios.get(api_url)
        .then((response) => {
            let stringifyResponse = CircularJSON.stringify(response.data);
                return res.status(200).json({
                    success: true,
                    error: false,
                    data: JSON.parse(stringifyResponse),
                    translations: JSON.parse
                })
        }).catch((_error) => {
            return res.status(400).json({
                success: false,
                error: true,
                message: _error.message
            })
        })
})

console.log(`serve is listening on ${PORT}`);

export default app;