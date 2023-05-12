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
        fs.writeFileSync("res/" + file_name, courseJson);
    }

    static fromFile(file_name) {
        const fs = require('fs');
        const courseJson = fs.readFileSync("res/" + file_name, 'utf8');
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