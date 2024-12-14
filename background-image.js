



var imageArr = ['image-1', 'image-2', 'image-3', 'image-4','image-5','image-6','image-7','image-8', 'image-10','image-11', 'image-13', 'image-14','image-16', 'image-17', 'image-18','image-19','image-20','image-21', 'image-22', 'image-23', 'image-24','image-25','image-26','image-27', 'image-28', 'image-29','image-31', 'image-33', 'image-34','image-36','image-37'];
let arrLength = imageArr.length;

let imageIndex = randomIndex(arrLength);



function randomIndex(arrLength) {

    return (Math.floor(Math.random()*arrLength));
}


function loadBackground(image) {

///images/image-1.jpg
document.body.style.backgroundImage = `url(images/${image}.jpg)`; 
document.body.style.backgroundSize = "cover";

}

document.addEventListener("DOMContentLoaded", () => {
    loadBackground(imageArr[imageIndex]);
});



