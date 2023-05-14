// for each course in res/courses
// create CourseMeta
// Add ti courses.json

const fs = require('fs');
const path = require('path');
const { Course, CourseMeta } = require('../class/course');

// get all courses from res/courses
const courses = fs.readdirSync(path.join(__dirname, './courses'));
let courseJsons = [];
// for each course in courses (courses being an array of json files)
courses.forEach(course => {
    // get the json file
    const courseJson = require(path.join(__dirname, `./courses/${course}`));
    // create a CourseMeta object
    let courseMeta = null;
    if (courseJson.image) {
        courseMeta = new CourseMeta(courseJson.title, courseJson.description, courseJson.id, courseJson.image);
    } else {
        courseMeta = new CourseMeta(courseJson.title, courseJson.description, courseJson.id, `https://liftlearning.com/wp-content/uploads/2020/09/default-image.png`);
    }
    // add the CourseMeta object to the array
    courseJsons.push(courseMeta);
});

// sort by id, (highest is first)
courseJsons.sort((a, b) => {
    return b.id - a.id;
});

// make sure to put the courses in an array
courseJsons = { "courses": courseJsons };


// write the array to courses.json
fs.writeFileSync(path.join(__dirname, './courses.json'), JSON.stringify(courseJsons, null, 4));