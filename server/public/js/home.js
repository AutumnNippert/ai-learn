document.addEventListener('DOMContentLoaded', function() {
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

