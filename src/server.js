import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 4300;
app.listen(PORT);

app.get('/getMovieDetails', (req, res, next) => {
    console.log("get movie details");
    let api_url = `https://api.themoviedb.org/3/movie/550?api_key=c43584493dfea10989cdc04f99ffd285`;
    return axios.get(api_url)
        .then((response) => {
            // console.log("response", response);
                return res.status(200).json({
                    success: true,
                    error: false,
                    data: response
                })
        }).catch((_error) => {
            console.log("its an error")
            return res.status(400).json({
                success: false,
                error: true,
                message: _error.message
            })
        })
})

console.log(`serve is listening on ${PORT}`);

export default app;