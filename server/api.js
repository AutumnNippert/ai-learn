const fs = require('fs');
const express = require('express');
const app = express();

const { Course, CourseMeta } = require('./class/course');
const { generateCourse } = require('./bin/course_generator');
const { log } = require('./bin/logger');

const config = JSON.parse(fs.readFileSync("res/server_config.json"));

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

app.get('/API/images/:image_id', (req, res) => {
    console.log(`API/images/${req.params.image_id}`);
    try {
        const image = fs.readFileSync(`res/images/${req.params.image_id}.png`);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(image, 'binary');
    } catch (error) {
        console.log(error.message);
        if (error.code === 'ENOENT') {
            res.status(404).send('Image not found');
        } else {
            res.status(500).send('Error fetching image');
        }
    }
});

app.listen(config.PORT, config.HOSTNAME, () => {
    console.log(`API running at ${config.PROTOCOL}://${config.HOSTNAME}:${config.PORT}`)
});