    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');

    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      iconOpen.classList.toggle('hidden');
      iconClose.classList.toggle('hidden');
    });
