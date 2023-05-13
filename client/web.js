const axios = require('axios');

const express = require('express');
const app = express();

const port = 3001;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/course/:course_id', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:3000/API/get_course/${req.params.course_id}`);
        const course = response.data;
        res.render('course', { course });
    } catch (error) {
        if (error.response.status === 404) {
            res.status(404).send('Course Not Found');
        } else {
            res.status(500).send('Error fetching course data');
        }
    }
});

//err page
app.get('*', (req, res) => {
    res.render('error', { error: '404: Page Not Found' });
});

app.listen(port, () => {
    console.log('Server started on port ' + port);
});
