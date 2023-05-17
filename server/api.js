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
        // write to file in res/progress/course.id.json in the format of: {course.id: percentComplete}

        const filePath = `res/progress.json`;
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "");
        }

        // get data from the file
        let data = { [courseTitle]: { lesson: null, progress: 0 } };
        let coursesInProgress = fs.readFileSync(filePath, 'utf8');
        if (coursesInProgress === "") {
            coursesInProgress = JSON.stringify({ "coursesInProgress": [] }, null, 4);
            fs.writeFileSync(filePath, coursesInProgress);
        }
        coursesInProgress = JSON.parse(coursesInProgress).coursesInProgress;
        // overwrite if course already exists
        coursesInProgress = coursesInProgress.filter((course) => {
            return Object.keys(course)[0] !== courseTitle;
        });

        coursesInProgress.push(data);
        let newProgresses = JSON.stringify({ "coursesInProgress": coursesInProgress }, null, 4);
        fs.writeFileSync(filePath, newProgresses);

        const courseGenerator = generateCourse(courseTitle, moduleCount);

        let listOStuff = [];

        for await (let { lesson, percentComplete } of courseGenerator) {
            const pc = Math.round(percentComplete * 100);

            data = { [courseTitle]: { lesson: lesson, progress: pc } };
            coursesInProgress = fs.readFileSync(filePath, 'utf8');

            coursesInProgress = JSON.parse(coursesInProgress).coursesInProgress;
            coursesInProgress = coursesInProgress.filter((course) => {
                return Object.keys(course)[0] !== courseTitle;
            });
            coursesInProgress.push(data);
            newProgresses = JSON.stringify({ "coursesInProgress": coursesInProgress }, null, 4);
            fs.writeFileSync(filePath, newProgresses);

            listOStuff.push(lesson);
        }
        // Remove the course from the progress file
        console.log('Removing course from progress file');
        coursesInProgress = fs.readFileSync(filePath, 'utf8');
        coursesInProgress = JSON.parse(coursesInProgress).coursesInProgress;
        coursesInProgress = coursesInProgress.filter((course) => {
            return Object.keys(course)[0] !== courseTitle;
        });
        newProgresses = JSON.stringify({ "coursesInProgress": coursesInProgress }, null, 4);
        fs.writeFileSync(filePath, newProgresses);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error fetching course data');
    }
});

app.get('/API/get_course/:course_name', async (req, res) => {
    console.log(`API/get_course/${req.params.course_id}`);
    try {
        const course = Course.fromFile(`${req.params.course_name}.json`);
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

app.get('/API/progress/:course_name', (req, res) => {
    console.log(`API/progress/${req.params.course_name}`);
    try {
        const progress = fs.readFileSync(`res/progress.json`);
        // get progress from title
        const json = JSON.parse(progress);
        const cn = req.params.course_name;
        const dict = json.coursesInProgress.filter((course) => {
            return Object.keys(course)[0] === cn;
        })[0];
        res.json(dict);
    } catch (error) {
        console.log(error.message);
        if (error.code === 'ENOENT') {
            //res.status(404).send('Progress not found');
            res.json({ [req.params.course_name]: { lesson: null, progress: 100 } });
        } else {
            res.status(500).send('Error fetching progress');
        }
    }
});

app.listen(config.PORT, config.HOSTNAME, () => {
    console.log(`API running at ${config.PROTOCOL}://${config.HOSTNAME}:${config.PORT}`)
});