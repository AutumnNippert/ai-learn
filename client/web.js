const axios = require('axios');

const express = require('express');
const app = express();

const args = process.argv.slice(2); // Ignore first two arguments

// Default port number
let port = 80;

// Check for -port argument
const portIndex = args.indexOf('-port');
if (portIndex !== -1 && portIndex < args.length - 1) {
    port = parseInt(args[portIndex + 1], 10);
}

// Default hostname
let hostname = 'localhost';

// Check for -hostname argument
const hostnameIndex = args.indexOf('-hostname');
if (hostnameIndex !== -1 && hostnameIndex < args.length - 1) {
    hostname = args[hostnameIndex + 1];
}

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const apiURL = 'http://localhost:3000/API';

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${apiURL}/get_courses`);
        const courses = response.data;
        res.render('index', courses);
    } catch (error) {
        res.render('error', { error: '500: Internal Server Error' });
    }
});

app.get('/course/:course_id', async (req, res) => {
    try {
        const response = await axios.get(`${apiURL}/get_course/${req.params.course_id}`);
        const course = response.data;
        res.render('course', { course });
    } catch (error) {
        if (error.response.status === 404) {
            res.render('error', { error: '404: Course Not Found' });
        } else {
            res.render('error', { error: '500: Internal Server Error' });
        }
    }
});

app.post('/add_course/:courseName/:moduleCount', async (req, res) => {
    try {
        await axios.post(`${apiURL}/add_course/${req.params.courseName}/${req.params.moduleCount}`, req.body);
    } catch (error) {
        res.render('error', { error: '500: Internal Server Error' });
    }
});


//err page
app.get('*', (req, res) => {
    res.render('error', { error: '404: Page Not Found' });
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`)
});