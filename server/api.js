const express = require('express');
const app = express();

const { Course, CourseMeta } = require('./class/course');
const { generateCourse } = require('./bin/course_generator');
const { log } = require('./bin/logger');

const args = process.argv.slice(2); // Ignore first two arguments

// Default port number
let port = 3000;

// Check for -port argument
const portIndex = args.indexOf('-port');
if (portIndex !== -1 && portIndex < args.length - 1) {
    port = parseInt(args[portIndex + 1], 10);
}

app.get('/', (req, res) => {
    res.json({ message: `API Running on port ${port}` })
});

app.post('/API/add_course/:courseName/:moduleCount', async (req, res) => {
    try {
        const courseTitle = req.params.courseName;
        const moduleCount = parseInt(req.params.moduleCount, 10);
        log(`Generating course: ${courseTitle} | with ${moduleCount} modules`);
        const course = await generateCourse(courseTitle, moduleCount);
        course.toFile(`${course.id}.json`);
        res.json(course);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error fetching course data');
    }
});

app.get('/API/get_course/:course_id', async (req, res) => {
    console.log(`API/get_course/${req.params.course_id}`);
    try {
        const course = Course.fromFile(`${req.params.course_id}.json`);
        res.json(course);
    } catch (error) {
        console.log(error.message);
        if (error.code === 'ENOENT') {
            res.status(404).send('Course not found');
        } else {
            res.status(500).send('Error fetching course data');
        }
    }
});

app.get('/API/get_courses', (req, res) => {
    console.log('API/get_courses');
    try {
        const courses = CourseMeta.getAll();
        res.json(courses);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error fetching course data');
    }
});

app.listen(port, () => {
    console.log(`Rest API started listening on port ${port}`);
});
