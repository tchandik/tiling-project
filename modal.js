// Modal Calculator 


// Text Input Logic 
let origin = document.getElementById('origin'); 
let stretch = document.getElementById('stretch');


origin.addEventListener('focus', () => {
    origin.addEventListener('blur', () => {
    
        if (origin.value === '') {
            origin.value = 'Example: 10';
            origin.setAttribute('data-font','placeholder-input');

        } if (origin.value !== 'Fabric stretches too' && isNaN(origin.value)) {
            origin.value = 'Example: 10';

        } if (!isNaN(origin.value)) {
           origin.setAttribute('data-font','font-value');
        }
      
    })
})



stretch.addEventListener('focus', () => {
    stretch.addEventListener('blur', () => {
    
        if (stretch.value === '') {
            stretch.value = 'Example: 13';
            stretch.setAttribute('data-font','placeholder-input');

        } if (stretch.value !== 'Fabric stretches too' && isNaN(stretch.value)) {
            stretch.value = 'Example: 13';

        } if (!isNaN(stretch.value)) {
           stretch.setAttribute('data-font','font-value');
        }
      
    })
})




// End of Text Input Logic


let rdcCalcBtn = document.getElementById('rdc-calc-button-container');

rdcCalcBtn.addEventListener('click', (e) => {
    e.preventDefault();
   let origin = document.getElementById('origin').value; 
   let stretch = document.getElementById('stretch').value;

   let result = (100-((origin/stretch)*100));
   let resultRound = result.toFixed(2);

 

   document.getElementById('result').innerText = ` ${resultRound} %`;

});

// End of Modal Calculator 

//Get Modal Node List 
let modalNode = document.getElementsByClassName('modal'); 
//Open Modal 
let modalBtnNode = document.getElementsByClassName('fa-ruler'); 
//Close Modal Btn 
let closeBtnNode = document.getElementsByClassName('closeBtn');  





window.addEventListener('click', (e) =>{
    if(e.target == modalNode[0]) {
        modalNode[0].style.display = 'none';
    }
} )

modalBtnNode[0].addEventListener('click', () => {
    modalNode[0].style.display = 'block';
})

closeBtnNode[0].addEventListener('click', () => {
    modalNode[0].style.display = 'none';
})
//////////////////////////////////////////
window.addEventListener('click', (e) =>{
    if(e.target == modalNode[1]) {
        modalNode[1].style.display = 'none';
    }
} )

modalBtnNode[1].addEventListener('click', () => {
    modalNode[1].style.display = 'block';
})

closeBtnNode[1].addEventListener('click', () => {
    modalNode[1].style.display = 'none';
})
//////////////////////////////////////////
window.addEventListener('click', (e) =>{
    if(e.target == modalNode[2]) {
        modalNode[2].style.display = 'none';
    }
} )

modalBtnNode[2].addEventListener('click', () => {
    modalNode[2].style.display = 'block';
})

closeBtnNode[2].addEventListener('click', () => {
    modalNode[2].style.display = 'none';
})
//////////////////////////////////////////
window.addEventListener('click', (e) =>{
    if(e.target == modalNode[3]) {
        modalNode[3].style.display = 'none';
    }
} )

modalBtnNode[3].addEventListener('click', () => {
    modalNode[3].style.display = 'block';
})

closeBtnNode[3].addEventListener('click', () => {
    modalNode[3].style.display = 'none';
})
//////////////////////////////////////////
window.addEventListener('click', (e) =>{
    if(e.target == modalNode[4]) {
        modalNode[4].style.display = 'none';
    }
} )

modalBtnNode[4].addEventListener('click', () => {
    modalNode[4].style.display = 'block';
})

closeBtnNode[4].addEventListener('click', () => {
    modalNode[4].style.display = 'none';
})
//////////////////////////////////////////
window.addEventListener('click', (e) =>{
    if(e.target == modalNode[5]) {
        modalNode[5].style.display = 'none';
    }
} )

modalBtnNode[5].addEventListener('click', () => {
    modalNode[5].style.display = 'block';
})

closeBtnNode[5].addEventListener('click', () => {
    modalNode[5].style.display = 'none';
})



