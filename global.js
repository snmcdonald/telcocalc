// Copyright (c) 2026 Shane McDonald. All rights reserved.

document.addEventListener("DOMContentLoaded", () => {
  // Inject Header
  fetch('header.html')
    .then(response => response.text())
    .then(html => {
      const headerContainer = document.getElementById('site-header');
      if (headerContainer) headerContainer.innerHTML = html;
    })
    .catch(err => console.error('Error loading header:', err));

  // Inject Footer
  fetch('footer.html')
    .then(response => response.text())
    .then(html => {
      const footerContainer = document.getElementById('site-footer');
      if (footerContainer) footerContainer.innerHTML = html;
    })
    .catch(err => console.error('Error loading footer:', err));
});
