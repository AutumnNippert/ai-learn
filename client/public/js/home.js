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
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // do something like pop up a modal that says "Course Added" or something.
                return
            })
            .catch(error => {
                console.error('Error:', error);
            });

    });

});



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

