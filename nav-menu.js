

const primaryNav = document.querySelector('.primary-navigation'); 
const navToggle = document.querySelector('.mobile-nav-toggle');
const navLogo = document.querySelector('.logo');

const primHeader = document.querySelector('.primary-header');

const nav = document.querySelector('ul');






navToggle.addEventListener('click', () => {
  const visibility = primaryNav.getAttribute('data-visible'); 

if (visibility === 'false') {
    primaryNav.setAttribute('data-visible', true);
    navToggle.setAttribute('aria-expanded', true);
} else if (visibility === 'true') {
    primaryNav.setAttribute('data-visible', false); 
    navToggle.setAttribute('aria-expanded', false);
}

  
}); 





let lastScroll = 0; 

window.addEventListener('scroll', () => {


    const currentScroll = window.pageYOffset; 
   
    if (currentScroll <= 0) {
        
        // primaryNav.classList.remove('scroll-up');

        navToggle.classList.remove('prim-header-mobile-show ');
        navLogo.classList.remove('prim-header-mobile-show ');
        primHeader.classList.remove('prim-header-show-background');
    } 

    if (currentScroll > lastScroll) {
        
        primaryNav.classList.remove('scroll-up');
        primaryNav.classList.add('scroll-down');

        navToggle.classList.add('prim-header-mobile-hide');
        navToggle.classList.remove('prim-header-mobile-show');

        navLogo.classList.add('prim-header-mobile-hide');
        navLogo.classList.remove('prim-header-mobile-show');

        primHeader.classList.remove('prim-header-show-background');
    } 

    if (currentScroll < lastScroll) {

        primaryNav.classList.add('scroll-up');
        primaryNav.classList.remove('scroll-down');
       
        navToggle.classList.remove('prim-header-mobile-hide');
        navToggle.classList.add('prim-header-mobile-show');

        navLogo.classList.remove('prim-header-mobile-hide');
        navLogo.classList.add('prim-header-mobile-show');

        primHeader.classList.add('prim-header-show-background');
    } 

   

    lastScroll = currentScroll; 
 

})


