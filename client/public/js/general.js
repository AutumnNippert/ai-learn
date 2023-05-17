// This DOMContentLoaded eventlistener handles all the features relating to the sidebar.
document.addEventListener('DOMContentLoaded', function () {
    const sidebarButton = document.getElementById('sidebarButton');
    const sidebar = document.getElementById('sidebar');

    // NOTE TO SPENCER: MAKE THIS A DEBOUNCE FUNCTIOn LATER -------------------------------

    // Only using this dedicated function so that we can have a timeout.
    // The timeout is necessary so that we can set the visibility to hidden, but
    // retain the closing transition translate animation.
    function sidebarClose(state) {
        // only do this if we are still closing. if we interrupt the closing state, then
        // we no longer set the state to closed.
        if (sidebar.getAttribute("data-status") == "closing") {
            sidebar.setAttribute("data-status", state);
        }
    } 

    // Sidebar Handler
    sidebarButton.addEventListener('click', function () {
        // alert("OPEN SIDEBAR");

        if (sidebar.getAttribute("data-status") == "open") {
            sidebar.setAttribute("data-status", "closing");

            sidebarButton.classList.add('fa-bars');
            sidebarButton.classList.remove('fa-x');
            // without the timeout, the sidebar element is hidden immediately instead of 
            // going through the transition animation. timeout delay lets us have the animation.
            setTimeout(sidebarClose, 500, "closed");
        } else {
            sidebar.setAttribute("data-status", "open");
            sidebarButton.classList.remove('fa-bars');
            sidebarButton.classList.add('fa-x');

        }
    });

    // Sidebar Selection Handler
    const sidebarInnerButtons = sidebar.querySelectorAll('.sidebarInner');

    sidebarInnerButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            sidebarInnerButtons.forEach(function (button2) {
                button2.setAttribute("data-selected", "false")
            });
            button.setAttribute("data-selected", "true");
        });
    });
});

function displaySnackbar(text) {
    const delay = 3000;
    
    // Get the snackbar DIV
    var x = document.getElementById("snackbar");

    x.innerHTML = text;

    // set --time in the css from #snackbar to the delay
    x.style.setProperty('--time', delay + "ms");
  
    // Add the "show" class to DIV
    x.className = "show";
  
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, delay);
  }