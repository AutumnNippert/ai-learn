const express = require('express');
const app = express();

const { Course } = require('./bin/course');
const { generateCourse } = require('./bin/course_generator');
const { log } = require('./bin/logger');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/course/:course_id', (req, res) => {
  const course = Course.fromFile(`${req.params.course_id}.json`);
  res.render('course', { course });
});

app.post('/add_course', async (req, res) => {
  const courseTitle = req.body.courseName;
  const moduleCount = parseInt(req.body.moduleCount);
  log(`Generating course: ${courseTitle} | with ${moduleCount} modules`);
  const course = await generateCourse(courseTitle, moduleCount);
  course.toFile(`${course.id}.json`);
  res.redirect(`course/${course.id}`);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
