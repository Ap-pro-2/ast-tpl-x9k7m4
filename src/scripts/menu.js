// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  // Check if both elements exist before adding event listener
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      // Toggle the 'expanded' class to show or hide the menu
      navLinks.classList.toggle('expanded');
      
      // Toggle the 'active' class for the hamburger icon
      hamburger.classList.toggle('active');
    });
  }
});