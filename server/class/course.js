class Lesson {
    constructor(title, info) {
        this.title = title;
        this.info = info;
    }

    toString() {
        return this.title;
    }
}

class Module {
    constructor(title) {
        this.title = title;
        this.lessons = [];
    }

    addLesson(lesson) {
        this.lessons.push(lesson);
    }

    toString() {
        return this.title;
    }
}

class Course {
    constructor(title, description, id) {
        this.title = title;
        this.description = description;
        this.id = id;
        this.modules = [];
    }

    addModule(module) {
        this.modules.push(module);
    }

    toFile(file_name) {
        const fs = require('fs');
        const courseJson = JSON.stringify(this, null, 4, CourseEncoder);
        fs.writeFileSync("res/courses/" + file_name, courseJson);
        // add to courses.json
        const coursesJson = fs.readFileSync("res/courses.json", 'utf8');
        const toAdd = { "title": this.title, "description": this.description, "id": this.id };
        const courses = JSON.parse(coursesJson);
        courses.push(toAdd);
        fs.writeFileSync("res/courses.json", JSON.stringify(courses, null, 4));

        // add to courses.txt
        const meta = new CourseMeta(this.title, this.description, this.id);
        meta.toFile();
    }

    static fromFile(file_name) {
        const fs = require('fs');
        const courseJson = fs.readFileSync("res/courses/" + file_name, 'utf8');
        const course = JSON.parse(courseJson);
        return course;
    }

    toString() {
        return this.title + "\n" + this.description;
    }
}

class CourseEncoder {
    static default(o) {
        return o.dict;
    }
}

class CourseMeta {
    constructor(title, description, id) {
        this.title = title;
        this.description = description;
        this.id = id;
        this.image = "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg";
    }

    toFile() {
        // add to courses.json
        const fs = require('fs');
        const coursesJson = fs.readFileSync("res/courses.json", 'utf8');
        const courses = JSON.parse(coursesJson);
        if (courses == null) {
            courses = {};
        }
        const toAdd = { title: this.title, description: this.description, id: this.id, image: this.image};

        courses.push(toAdd);
        fs.writeFileSync("res/courses.json", JSON.stringify(courses, null, 4));
    }

    static getAll() {
        const fs = require('fs');
        const courseJson = fs.readFileSync("res/courses.json", 'utf8');
        const course = JSON.parse(courseJson);
        return course;
    }

    toString() {
        return this.title + "\n" + this.description;
    }
}



// Tests
if (require.main === module) {
    const c = new Course("Software Development", "This is a course on software development");
    let l = new Lesson("Test Lesson", "Woah! Info");
    let m = new Module("Test Module");
    m.addLesson(l);
    c.addModule(m);

    l = new Lesson("Test Lesson 2", "Woah! Info 2");
    m = new Module("Test Module 2");
    m.addLesson(l);
    c.addModule(m);

    c.toFile("test.json");
}

module.exports = { Course, Module, Lesson };