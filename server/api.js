// server.mjs

import fs from 'fs/promises';
import { existsSync } from 'fs';
import express from 'express';
import { Course, CourseMeta } from './class/course.js';
import { generateCourse } from './bin/course_generator.js';
import { log } from './bin/logger.js';

const app = express();

// Load config
const configRaw = await fs.readFile("res/server_config.json", "utf8");
const config = JSON.parse(configRaw);

// Routes
app.get('/', (req, res) => {
    res.json({ message: `API Running on port ${config.PORT}` });
});

app.post('/API/add_course/:courseName/:moduleCount', async (req, res) => {
    const courseTitle = req.params.courseName;
    const moduleCount = parseInt(req.params.moduleCount, 10);

    try {
        log(`Generating course: ${courseTitle} | with ${moduleCount} modules`);

        const filePath = `res/progress.json`;

        if (!existsSync(filePath)) {
            await fs.writeFile(filePath, JSON.stringify({ coursesInProgress: [] }, null, 4));
        }

        const updateProgress = async (lesson, percentComplete) => {
            let coursesInProgressRaw = await fs.readFile(filePath, 'utf8');
            let coursesInProgress = JSON.parse(coursesInProgressRaw).coursesInProgress;

            // Remove existing entry if exists
            coursesInProgress = coursesInProgress.filter(course => Object.keys(course)[0] !== courseTitle);

            const data = { [courseTitle]: { lesson, progress: Math.round(percentComplete * 100) } };
            coursesInProgress.push(data);

            const newProgress = JSON.stringify({ coursesInProgress }, null, 4);
            await fs.writeFile(filePath, newProgress);
        };

        const courseGenerator = generateCourse(courseTitle, moduleCount);
        const lessons = [];

        for await (const { lesson, percentComplete } of courseGenerator) {
            await updateProgress(lesson, percentComplete);
            lessons.push(lesson);
        }

        // After generation, remove the course from progress
        let coursesInProgressRaw = await fs.readFile(filePath, 'utf8');
        let coursesInProgress = JSON.parse(coursesInProgressRaw).coursesInProgress;
        coursesInProgress = coursesInProgress.filter(course => Object.keys(course)[0] !== courseTitle);
        await fs.writeFile(filePath, JSON.stringify({ coursesInProgress }, null, 4));

        res.json({ message: `Course '${courseTitle}' generated.` });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error generating course');
    }
});

app.get('/API/get_course/:course_name', async (req, res) => {
    try {
        const course = await Course.fromFile(`${req.params.course_name}.json`);
        res.json(course);
    } catch (error) {
        console.error(error.message);
        if (error.code === 'ENOENT') {
            res.status(404).send('Course not found');
        } else {
            res.status(500).send('Error fetching course data');
        }
    }
});

app.get('/API/get_courses', async (req, res) => {
    try {
        const courses = await CourseMeta.getAll();
        res.json(courses);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error fetching course data');
    }
});

app.get('/API/images/:image_id', async (req, res) => {
    try {
        const imageBuffer = await fs.readFile(`res/images/${req.params.image_id}.png`);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(imageBuffer);
    } catch (error) {
        console.error(error.message);
        if (error.code === 'ENOENT') {
            res.status(404).send('Image not found');
        } else {
            res.status(500).send('Error fetching image');
        }
    }
 });

app.get('/API/progress/:course_name', async (req, res) => {
    try {
        const progressRaw = await fs.readFile(`res/progress.json`, 'utf8');
        const { coursesInProgress } = JSON.parse(progressRaw);
        const courseName = req.params.course_name;
        const entry = coursesInProgress.find(course => Object.keys(course)[0] === courseName);

        if (entry) {
            res.json(entry);
        } else {
            res.json({ [courseName]: { lesson: null, progress: 100 } }); // Completed by default
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error fetching progress');
    }
});

// Start server
app.listen(config.PORT, config.HOSTNAME, () => {
    console.log(`API running at ${config.PROTOCOL}://${config.HOSTNAME}:${config.PORT}`);
});
