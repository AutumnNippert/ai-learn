let course;

function main(course){
    course = course;
    let currModule = course.modules[0];
    let currLesson = currModule.lessons[0];

    const moduleTitle = document.getElementById("moduleTitle");
    const lessonTitle = document.getElementById("lessonTitle");
    const lessonInfo = document.getElementById("lessonInfo");

    function setCurrModule(module) {
        currModule = module;
        moduleTitle.innerHTML = currModule.title;
    }

    function setCurrLesson(lesson) {
        currLesson = lesson;
        lessonTitle.innerHTML = currLesson.title;
        const info = lesson.info.replace(/\n/g, "<br>");
        lessonInfo.innerHTML = info;
        // set module to parent module of lesson
        setCurrModule(course.modules.find(module => module.lessons.includes(currLesson)));
    }

    setCurrLesson(currLesson);

    const moduleButtons = document.getElementsByClassName("module-button");
    const lessonButtons = document.getElementsByClassName("lesson-button");

    for (let i = 0; i < moduleButtons.length; i++) {
        moduleButtons[i].addEventListener("click", () => {
            setCurrLesson(course.modules[i].lessons[0]);
        });
    }

    const lessonCounts = course.modules.map(module => module.lessons.length);
    let buttonNum = 0;
    let module = 0;

    for (let i = 0; i < lessonButtons.length; i++) {
        // if greater than lessoncounts[module] then set to 0 and increment module
        for (let m = 0; m < lessonCounts.length; m++) {
            if (i >= lessonCounts[module]) {
                if (buttonNum >= lessonCounts[module]) {
                    buttonNum -= lessonCounts[module];
                    module++;
                    break;
                }
            }
        }
        const currentButtonNum = buttonNum; // save current button number
        const currentModule = module; // save current module number
        console.log(i, currentButtonNum, currentModule)
        lessonButtons[i].addEventListener("click", () => {
            setCurrLesson(course.modules[currentModule].lessons[currentButtonNum]);
        });
        buttonNum++;
    }

    const nextButton = document.getElementById("nextButton");
    const prevButton = document.getElementById("prevButton");

    nextButton.addEventListener("click", () => {
        // get button of next lesson
        const lessonIndex = currModule.lessons.indexOf(currLesson);
        // if lessonIndex < currModule.lessons.length - 1 then set to next lesson
        if (lessonIndex < currModule.lessons.length - 1) {
            setCurrLesson(currModule.lessons[lessonIndex + 1]);
        }
        // else if lessonIndex == currModule.lessons.length - 1 then set to first lesson of next module
        else {
            const moduleIndex = course.modules.indexOf(currModule);
            if (moduleIndex < course.modules.length - 1) {
                setCurrLesson(course.modules[moduleIndex + 1].lessons[0]);
            }
        }
    });

    prevButton.addEventListener("click", () => {
        // get button of previous lesson
        const lessonIndex = currModule.lessons.indexOf(currLesson);
        // if lessonIndex > 0 then set to previous lesson
        if (lessonIndex > 0) {
            setCurrLesson(currModule.lessons[lessonIndex - 1]);
        }
        // else if lessonIndex == 0 then set to last lesson of previous module
        else {
            const moduleIndex = course.modules.indexOf(currModule);
            if (moduleIndex > 0) {
                setCurrLesson(course.modules[moduleIndex - 1].lessons[course.modules[moduleIndex - 1].lessons.length - 1]);
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const moduleLessonDivs = document.querySelectorAll('.module-lessons');
    const moduleButtons = document.querySelectorAll(".module-button");

    // initial states
    moduleLessonDivs[0].setAttribute("data-status", "open");
    var firstLesson = moduleLessonDivs[0].querySelector('.lesson-button');
    firstLesson.setAttribute("data-selected", "true");

    for (var i = 0; i < moduleLessonDivs.length; i++) {
        (function(index) {
            moduleButtons[index].addEventListener('click', function() {
            if (moduleLessonDivs[index].getAttribute("data-status") == "open") {
                moduleLessonDivs[index].setAttribute("data-status", "closed");
            } else {
                moduleLessonDivs[index].setAttribute("data-status", "open");
            }
            });
        })(i);
    }
});