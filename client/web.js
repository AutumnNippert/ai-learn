const fs = require('fs');
const axios = require('axios');
const express = require('express');


const app = express();

const args = process.argv.slice(2); // Ignore first two arguments

// load config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Default port number
let port = config.DEFAULT_PORT;

// Check for -port argument
const portIndex = args.indexOf('-port');
if (portIndex !== -1 && portIndex < args.length - 1) {
    port = parseInt(args[portIndex + 1], 10);
}

// Default hostname
let hostname = config.DEFAULT_HOSTNAME;

// Check for -hostname argument
const hostnameIndex = args.indexOf('-hostname');
if (hostnameIndex !== -1 && hostnameIndex < args.length - 1) {
    hostname = args[hostnameIndex + 1];
}

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const apiURL = config.DEFAULT_API_URL;

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

app.get('/full-course/:course_id', async (req, res) => {
    try {
        const response = await axios.get(`${apiURL}/get_course/${req.params.course_id}`);
        const course = response.data;
        res.render('fullCourse', { course });
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

app.get('/progress/:course_name', async (req, res) => {
    try {
        const response = await axios.get(`${apiURL}/progress/${req.params.course_name}`);
        if (response.status === 404) {
            res.status(404);
        } else {
            res.json(response.data);
        }
    } catch (error) {
        console.log(error);
        if (error.status === 404) {
            res.json({ error: '404: Course Not Found' });
        } else {
            res.json({ error: '500: Internal Server Error' });
        }
    }
});

app.get('/about', (req, res) => {
    res.render('about');
});

//err page
app.get('*', (req, res) => {
    res.render('error', { error: '404: Page Not Found' });
});

app.listen(port, hostname, () => {
    console.log(`Web server running at http://${hostname}:${port}`)
});