let creatingCourse;

// Clickable Course Elements
document.addEventListener('DOMContentLoaded', function () {
    var courseElements = document.querySelectorAll('.courseElement');
    courseElements.forEach(function (element) {
        element.addEventListener('click', function () {
            console.log(element.course_id);
            window.location.href = `/course/${element.dataset.courseId}`;
        });
    });
});


// Add Courses Button and Modal
document.addEventListener('DOMContentLoaded', function () {
    // Courses Page-----------
    const addCourseButton = document.getElementById('addCourseButton');

    // Get the modal
    var modal = document.getElementById("addCourseModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    addCourseButton.onclick = function () {
        if(creatingCourse) {
            displaySnackbar("Please wait for the current course to finish generating.");
            return;
        }
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Submit Button when the modal is viewed. This is displayed as "Add Course" on the page.

    const submitButton = document.getElementById('submitCourse');
    var courseNameInput = document.getElementById('courseName');
    var moduleCountInput = document.getElementById('moduleCount');

    submitButton.addEventListener('click', async function () {
        var courseName = courseNameInput.value;
        var moduleCount = moduleCountInput.value;

        console.log(courseName); // logs the value of the courseName input
        console.log(moduleCount); // logs the value of the moduleCount input

        const input = {
            courseName: `${courseName}`,
            moduleCount: `${moduleCount}`,
        }

        console.log("submitting add course request with items: " + courseName + ": " + moduleCount);
        console.log(input);
        console.log(JSON.stringify(input));
        fetch(`/add_course/${courseName}/${moduleCount}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        })
            .catch(error => {
                modal.style.display = "none";
                alert("An error occurred. Please try again later.");
                console.error('Error:', error);
            });

        creatingCourse = true;

        // close the modal
        modal.style.display = "none";
        // toast message
        displaySnackbar("Course Generating...");

        startProgressBar(courseName);
    });

});

// Search Bar Functionality 
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById("searchInput");

    // tracks when the searchInput is updated
    searchInput.addEventListener("input", function () {
        var currInput = searchInput.value;
        currInput = currInput.toLowerCase();

        // console.log("Current Input: " + currInput);
        searchForCourseAndHideOthers(currInput);
    });
});

// modal course name search
document.addEventListener('DOMContentLoaded', function () {
    // Modal course name search
    const modalCourseNameInput = document.getElementById("courseName");

    // tracks when the searchInput is updated
    modalCourseNameInput.addEventListener("input", function () {
        var currInput = modalCourseNameInput.value;
        currInput = currInput.toLowerCase();

        const similarCourses = getSimilarCourses(currInput);

        // create a span for each similar course
        const similarCoursesContainer = document.getElementById("similarCoursesContainer");
        similarCoursesContainer.innerHTML = "";
        similarCourses.forEach(function (course) {
            const span = document.createElement("span");
            span.classList.add("similarCourse");
            span.innerHTML = course.querySelector("h1").innerHTML;
            similarCoursesContainer.appendChild(span);
            span.addEventListener("click", function () {
                // take you to the course page
                window.location.href = `/course/${course.dataset.courseId}`;
            });
            span.appendChild(document.createElement("br"));
        }
        );
    });
});

// Searches for a course element on the page using an input string (used for the search bar)
// Hides nonmatching courses. Only shows matching courses.
// an empty input hits true on all courses.
function searchForCourseAndHideOthers(courseName) {
    const simCourseElems = getSimilarCourses(courseName);
    const courseElems = document.querySelectorAll('.courseElement');

    courseElems.forEach(function (element) {
        // Search for the course title inside of the course element's h1
        if (simCourseElems.includes(element)) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    });
}

function getSimilarCourses(searchStr) {
    if (searchStr == "") {
        return [];
    }
    let keywords = searchStr.trim().toLowerCase().split(" ");
    // remove filler words
    const fillerWords = ["a", "an", "the", "of", "and", "or", "but", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "should", "can", "could", "may", "might", "must", "shall", "should", "to", "in", "on", "at", "by", "for", "from"];
    keywords = keywords.filter(word => !fillerWords.includes(word));

    // get courses that contain the keywords
    const courseElems = document.querySelectorAll('.courseElement');
    let courses = [];
    courseElems.forEach(function (element) {
        // Search for the course title inside of the course element's h1
        var title = element.querySelector("h1");
        var titleText = title.innerHTML.toLowerCase();
        var titleWords = titleText.split(" ");
        var isSimilar = false;
        keywords.forEach(function (keyword) {
            titleWords.forEach(function (titleWord) {
                if (titleWord.includes(keyword)) {
                    isSimilar = true;
                }
            });
        });
        if (isSimilar) {
            courses.push(element);
        }
    });

    // sort by similarity to search string
    courses.sort(function (a, b) {
        var aTitle = a.querySelector("h1").innerHTML.toLowerCase();
        var bTitle = b.querySelector("h1").innerHTML.toLowerCase();
        var aSimilarity = 0;
        var bSimilarity = 0;
        keywords.forEach(function (keyword) {
            if (aTitle.includes(keyword)) {
                aSimilarity++;
            }
            if (bTitle.includes(keyword)) {
                bSimilarity++;
            }
        });
        return bSimilarity - aSimilarity;
    });
    return courses;
}


// progress bar
function startProgressBar(course_name) {
    var bar = document.getElementById("progressBar");
    var inner = document.getElementById("progressBarInner");
    var text = document.getElementById("progressBarText");

    bar.style.display = "block";
    inner.style.width = "0%";
    text.innerHTML = `Creating Course: ${course_name}`;
    text.style.display = "flex";


    // add a timer for every 1 second
    var isComplete = false;
    var intervalId = setInterval(getProgress, 5000);
    function getProgress() {
        if (isComplete) {
            clearInterval(intervalId);
            bar.style.display = "none";
            text.style.display = "none";
            text.innerHTML = "loading...";
            displaySnackbar("Course Complete! Refresh page to see!");
            creatingCourse = false;
        } else {
            fetch(`/progress/${course_name}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify()
            })
                .then(response => {
                    if (response.status !== 200) {
                        bar.style.display = "none";
                        text.style.display = "none";
                        text.innerHTML = "loading...";
                        displaySnackbar("Server error occured...");
                        console.error('Error:', error);
                        clearInterval(intervalId);
                        creatingCourse = false;
                    } else {
                        return response.json();
                    }
                })
                .then(data => {
                    console.log(data);
                    // if data doesn't have the course name, done
                    if (!data.hasOwnProperty(course_name)) {
                        isComplete = true;
                        return;
                    }
                    const percent = data[course_name].progress;
                    const lessonName = data[course_name].lesson;
                    // set the width of the progress bar
                    inner.style.width = percent + "%";
                    // set the text of the progress bar
                    text.innerHTML = lessonName + " | " + percent + "%";

                    if (lessonName === null) {
                        text.innerHTML = `Creating Course: ${course_name}`;
                    }

                    if (percent >= 100) {
                        isComplete = true;
                    }
                })
                .catch(error => {
                    bar.style.display = "none";
                    text.style.display = "none";
                    text.innerHTML = "loading...";
                    displaySnackbar("Something shat...");
                    console.error('Error:', error);
                    clearInterval(intervalId);
                    creatingCourse = false;
                });
        }
    }
}

// Favoriting feature may or may not get axed.
// While this does technically work, due to how we interact with course Elements you also
// end up clicking that, and getting redirected as a result.
function favorite(courseID) {
    const course = document.getElementById(courseID);
    const starButton = course.querySelector('.favoriteButton');
    if (starButton.getAttribute("data-favorited") == "true") {
        starButton.setAttribute("data-favorited", "false");
        starButton.classList.add("fa-regular");
        starButton.classList.remove("fa-solid");

        course.classList.add("favorite");
    } else {
        starButton.setAttribute("data-favorited", "true");
        starButton.classList.remove("fa-regular");
        starButton.classList.add("fa-solid");

        course.classList.remove("favorite");

    }
}