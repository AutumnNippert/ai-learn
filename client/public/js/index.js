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

        // close the modal
        modal.style.display = "none";
        // toast message
        displaySnackbar("Course Added! Generating...", 3000);

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

// Searches for a course element on the page using an input string (used for the search bar)
// Hides nonmatching courses. Only shows matching courses.
// an empty input hits true on all courses.
function searchForCourseAndHideOthers(courseName) {
    const courseElems = document.querySelectorAll('.courseElement');

    courseElems.forEach(function (element) {
        // Search for the course title inside of the course element's h1
        var title = element.querySelector("h1");
        // console.log("searchForCourse(" + courseName + ") vs " + title.innerText);
        if (title.innerText.toLowerCase().includes(courseName)) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    });
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
            displaySnackbar("Course Complete! Refresh page to see!", 3000);
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
                        displaySnackbar("Server error occured...", 3000);
                        console.error('Error:', error);
                        clearInterval(intervalId);
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
                    displaySnackbar("Something shat...", 3000);
                    console.error('Error:', error);
                    clearInterval(intervalId);
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