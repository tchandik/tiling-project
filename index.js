
// require dependencies
const PDFDocument = require('pdfkit');
const { PDFDocument: PDFLibDocument } = require('pdf-lib'); // For pdf-lib
const blobStream = require('blob-stream');
const { x, circle, y } = require('pdfkit');


let form = document.getElementById('form');      


// -------------------------------------------------------------------------
//  IMPERIAL / METRIC - RADIO BUTTON 
// -------------------------------------------------------------------------

let cmInput = document.getElementById('cm'); 
let inInput = document.getElementById('in'); 



// -------------------------------------------------------------------------
//  SUBMIT EVENT
// -------------------------------------------------------------------------
  form.addEventListener('submit', function(e) {  
          
    e.preventDefault();   
    let elements = this.elements;
    
    let i;
    let arr = [];
    for (i = 2; i < elements.length; i++) {
        arr.push(elements[i].value);
    }
    

        
    const ptConversion = (cmInput, inInput) => {

        if (cmInput.checked && !inInput.checked) {
            return 28.346456693; 
        } 
        if (inInput.checked && !cmInput.checked){
            return 72;
        }
            return undefined;
        
        };
let conversion = ptConversion(cmInput, inInput);

measurements(arr, conversion);


  });

// -------------------------------------------------------------------------
//  NEGATIVE EASE FORM VALIDATION
// -------------------------------------------------------------------------

let easeInput = document.getElementById('rdcRatio'); 

easeInput.addEventListener('keyup', (e) => {
    e.preventDefault(); 
    let easeInput = document.getElementById('rdcRatio').value; 
    let elements = document.getElementsByClassName('input-control');
    let inputControlEase = elements[18];
  


    if (easeInput > 40) {
        
       
        errorMsg.setAttribute('data-error','show');
        inputControlEase.classList.add('error');
       
        
        
     }
 
     if (easeInput < 40) {
         
      
         errorMsg.setAttribute('data-error','hide');
         inputControlEase.classList.remove('error');
         
         
      }
   


});

easeInput.addEventListener('blur', () => {
    let errorMsg = document.getElementById('errorMsg');

    if (easeInput.value > 40) {
        easeInput.value = '';
        errorMsg.setAttribute('data-error','show');
        
    }


    if (easeInput.value >= 0 && easeInput < 40 ) {
        errorMsg.setAttribute('data-error','hide');
       

    }
    
})



// -------------------------------------------------------------------------
//  FORM VALIDATION
// -------------------------------------------------------------------------

let el = form.elements.required;


form.addEventListener('submit', (e) => {
    e.preventDefault(); 
    validateInputs();
    
    
});



const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success')
}

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const validateInputs = () => {


let i;
    for (i = 0; i < el.length; i++) {
     
    let elValue = el[i].value;
     let elInfo = el[i].title;

       if(elValue === '') {
           setError(el[i], `${elInfo} measurement is required`); 
           
           
       } else {
           setSuccess(el[i]);
       }
    }; 

    

  
//---------------RADIO BUTTON VALIDATION-------------------------------------------------------------
   if (!cmInput.checked && !inInput.checked) {
       setError(cmInput, 'Please choose a unit of measurement'); 
       setError(inInput, 'Please choose units of measurement');
   } else {
    setSuccess(cmInput, '');
    setSuccess(inInput, '');
    
    };

    
};

// -------------------------------------------------------------------------------------------------------------------------------------
//  CALCULATIONS FOR SLOPER 
// -------------------------------------------------------------------------------------------------------------------------------------
//Wrap the document in a function that takes the input from an event listener

// arr = ARRAY with measurement inputs and Conversion ratio from event listern, 
function measurements(arr, conversion) {

   


    let ptConversion = conversion;   //To convert size inputs from points to either inches or cm
    
    sizeArrCon = arr.map(x => x*ptConversion); //multiply every element in the array
    
    
    let waist = sizeArrCon[0]; 
    let skirtLength = sizeArrCon[1]; 
    let backSkirtLength = sizeArrCon[2];
    let seamAllowance = sizeArrCon[3]; 
    let saHem = sizeArrCon[4]; //Seam Allowance at hem
    let rdcRatio = (100-arr[5])/100;
// -------------------------------------------------------------------------------------------------------------------------------------
// TILING FUNCTIONS - START
// -------------------------------------------------------------------------------------------------------------------------------------

// Function to tile the PDF
async function tilePDF(arrayBuffer) {
    const A4_WIDTH = 595.27; // 210mm in points
    const A4_HEIGHT = 841.89; // 297mm in points

    const originalPdf = await PDFLibDocument.load(arrayBuffer); // Use pdf-lib's PDFDocument
    const outputPdf = await PDFLibDocument.create();

    for (let pageIndex = 0; pageIndex < originalPdf.getPageCount(); pageIndex++) {
        const originalPage = originalPdf.getPage(pageIndex);
        const originalWidth = originalPage.getWidth();
        const originalHeight = originalPage.getHeight();

        const cols = Math.ceil(originalWidth / A4_WIDTH);
        const rows = Math.ceil(originalHeight / A4_HEIGHT);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * A4_WIDTH;
                const y = originalHeight - (row + 1) * A4_HEIGHT;
                const cropWidth = Math.min(A4_WIDTH, originalWidth - x);
                const cropHeight = Math.min(A4_HEIGHT, y + A4_HEIGHT);

                const embeddedPage = await outputPdf.embedPage(originalPage, {
                    left: x,
                    bottom: y,
                    right: x + cropWidth,
                    top: y + cropHeight,
                });

                const scaleX = A4_WIDTH / cropWidth;
                const scaleY = A4_HEIGHT / cropHeight;
                const scale = Math.min(scaleX, scaleY);

                const offsetX = (A4_WIDTH - cropWidth * scale) / 2;
                const offsetY = (A4_HEIGHT - cropHeight * scale) / 2;

                const a4Page = outputPdf.addPage([A4_WIDTH, A4_HEIGHT]);
                a4Page.drawPage(embeddedPage, {
                    x: offsetX,
                    y: offsetY,
                    width: cropWidth * scale,
                    height: cropHeight * scale,
                });
            }
        }
    }

    return await outputPdf.save(); // Return tiled PDF bytes
}

// -------------------------------------------------------------------------------------------------------------------------------------
// TILING FUNCTIONS - END
// -------------------------------------------------------------------------------------------------------------------------------------


// -------------------------------------------------------------------------------------------------------------------------------------
// START OF SKIRT CALCULATION FUNCTIONS
// -------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------
//  CALCULATION OF R values
// -------------------------------------------------------------------------------------------------------------------------------------
 function rCalc(waist,rdcRatio) {
    return ((waist*rdcRatio)/(2*Math.PI));
 }

 let r = rCalc(waist,rdcRatio);

//  Skirt Front
 let rOuterCircle = r+skirtLength; //skirt circle -  no seam allowance
 let rHem = saHem + skirtLength + r; //skirt circle - seam allowance

// Skirt Back 

let rCb = r + backSkirtLength; //Back skirt circle - No seam allowance
let rCbSA = r + backSkirtLength + saHem; // Back skirt circle - seam allowance 


// Waist Band Circle
 let rSa = r - seamAllowance; // seam allowance at waist band

 

// -------------------------------------------------------------------------------------------------------------------------------------
// END OF R CALCULATION
// -------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------
// CALCULATION OF OF BEZIER CONTROL POINT USING d=r*4*(sqrt(2)-1)/3 
// -------------------------------------------------------------------------------------------------------------------------------------

function bezierCpCalc(r) {
    return ((4*r)*((Math.sqrt(2))-1))/3
}
// Skirt Front 
let cpNoHem = bezierCpCalc(rOuterCircle); //Length of control point of outer circle - no Hem Allowance
let cpHem = bezierCpCalc(rHem); //Length of Control point at Outer Hem Allowance Circle

// Skirt Back 

let cbCp = bezierCpCalc(rCb); // Length of control point of Back Circle - no hem allowance 
let cbCpSA = bezierCpCalc(rCbSA); // Length of control point of Back Circle - hem allowance 


// Waist band circle 
let cpWaistNoSa = bezierCpCalc(r); //length of control point of inner circle -  No Seam Allowance
let cpSA = bezierCpCalc(rSa); //Length of Control Point for inner waist Seam Allowance




//-------------------------------------------------------------------------------------------------------------------------------------
// END CALCULATION OF OF BEZIER CONTROL POINT USING d=r*4*(sqrt(2)-1)/3 
// -------------------------------------------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------------------------------------------
// END OF SLOPE OF TANGENT
// -------------------------------------------------------------------------------------------------------------------------------------

let xCordinates = {
    1: rCbSA-rOuterCircle, //(r + backSkirtLength + saHem) - (r+skirtLength)
    2: saHem+backSkirtLength, 
    3: backSkirtLength+saHem+(2*r),
    4: saHem+backSkirtLength+(2*r)+skirtLength, 
    5: rCbSA, 
    6: saHem+backSkirtLength+r, 
    7: rCbSA-rHem,
    8: saHem+backSkirtLength+r, 
    9: (2*saHem)+backSkirtLength+(2*r)+skirtLength, 
    10: rCbSA-rHem, 
    11: (saHem+backSkirtLength)+(r-rSa), 
    12: (backSkirtLength+r) + saHem,
    13: (saHem+backSkirtLength+(2*r))-(r-rSa), 
    14: (2*saHem)+backSkirtLength+(2*r)+skirtLength, 
    15: (saHem+backSkirtLength)+(r-rSa), 
    16: (saHem+backSkirtLength+(2*r))-(r-rSa), 
    21: rCbSA-rHem, 
    22: rCbSA-rOuterCircle, 
    23: saHem+backSkirtLength, 
    24: backSkirtLength+saHem+(2*r), 
    25: saHem+backSkirtLength+(2*r)+skirtLength,
    26: (2*saHem)+backSkirtLength+(2*r)+skirtLength, 
    27:(backSkirtLength+r) + saHem, 
    28:(backSkirtLength+r) + saHem, 
    29:(backSkirtLength+r) + saHem, 
    30: (backSkirtLength+r) + saHem, 
    31: (saHem+backSkirtLength)+(r-rSa), 
    32: (saHem+backSkirtLength+(2*r))-(r-rSa), 
    33: rCbSA-rHem, 
    34: (saHem+backSkirtLength)+(r-rSa), 
    35: (saHem+backSkirtLength+(2*r))-(r-rSa),
    36: (2*saHem)+backSkirtLength+(2*r)+skirtLength,



}


console.log(xCordinates);
console.log(rCbSA);
console.log(rOuterCircle); 
console.log(rCbSA-rOuterCircle); 

let yCordinates = {
    1: r + skirtLength + saHem, 
    2: r + skirtLength + saHem, 
    3: r + skirtLength + saHem, 
    4: r + skirtLength + saHem, 
    5: saHem, 
    6: skirtLength + saHem, 
    7: r + skirtLength + saHem,
    8: 0,
    9: (r+skirtLength+saHem), 
    10: (r+skirtLength+saHem) +seamAllowance, 
    11: r + skirtLength + saHem, 
    12: skirtLength + saHem + (r-rSa), 
    13: r + skirtLength + saHem, 
    14: (r+skirtLength+saHem) + seamAllowance, 
    15:  r + skirtLength + saHem + seamAllowance, 
    16:  r + skirtLength + saHem + seamAllowance, 
    21: rHem+seamAllowance, 
    22: rHem+seamAllowance, 
    23: rHem+seamAllowance, 
    24: rHem+seamAllowance, 
    25: rHem+seamAllowance, 
    26: rHem+seamAllowance,
    27: rHem+rSa+seamAllowance, 
    28: rHem + r + seamAllowance, 
    29: rHem+ rCb+seamAllowance, 
    30: rHem+rCbSA+seamAllowance, 
    31: rHem+seamAllowance, 
    32: rHem+seamAllowance, 
    33: rHem, 
    34: rHem,  
    35: rHem, 
    36: rHem, 

}

let xControlPoints = {
    1: rCbSA-rOuterCircle,
    5: rCbSA-cpNoHem,
    51: rCbSA+cpNoHem, 
    4: saHem+backSkirtLength+(2*r)+skirtLength, 
    2: saHem+backSkirtLength, 
    6: rCbSA-cpWaistNoSa, 
    61: rCbSA+cpWaistNoSa, 
    3: backSkirtLength+saHem+(2*r), 
    7: rCbSA-rHem, 
    8: rCbSA-cpHem, 
    81: rCbSA+cpHem, 
    9:(2*saHem)+backSkirtLength+(2*r)+skirtLength, 
    11: (saHem+backSkirtLength)+(r-rSa), 
    12: rCbSA-cpSA, 
    121: rCbSA+cpSA, 
    13: (saHem+backSkirtLength+(2*r))-(r-rSa), 
    21: rCbSA-rHem, 
    22: rCbSA-rOuterCircle, 
    23: saHem+backSkirtLength, 
    31: (saHem+backSkirtLength)+(r-rSa), 
    32:(saHem+backSkirtLength+(2*r))-(r-rSa), 
    24: backSkirtLength+saHem+(2*r), 
    25: saHem+backSkirtLength+(2*r)+skirtLength, 
    26:(2*saHem)+backSkirtLength+(2*r)+skirtLength,
    27: rCbSA-cpSA, //12
    271: rCbSA+cpSA, //12
    28: rCbSA-cpWaistNoSa, //6
    281: rCbSA+cpWaistNoSa, //6
    29: rCbSA-cbCp, 
    291: rCbSA+cbCp,
    30: rCbSA-cbCpSA,
    301: rCbSA + cbCpSA, 
 

}

let yControlPoints = {
    1: (r+skirtLength + saHem) - cpNoHem, 
    5: saHem, 
    51: saHem,
    4: (r + skirtLength + saHem) - cpNoHem, 
    2: (skirtLength+r + saHem) - cpWaistNoSa, 
    6: skirtLength + saHem, 
    61: skirtLength + saHem, 
    3: (skirtLength+r + saHem)-(cpWaistNoSa), 
    7: (saHem+skirtLength+r)-cpHem, 
    8: 0, 
    81: 0, 
    9: (saHem+skirtLength+r)-cpHem, 
    11: (saHem+skirtLength+r)-cpSA, 
    12: skirtLength + saHem + seamAllowance,
    121: skirtLength + saHem + seamAllowance, 
    13: (saHem+skirtLength+r)-cpSA, 

    21: r+skirtLength+saHem+seamAllowance+cbCpSA, //CP21
    22: r+skirtLength+saHem+seamAllowance+cbCp, 
    23: r+skirtLength+saHem+seamAllowance+cpWaistNoSa, 
    31: r+skirtLength+saHem+seamAllowance+cpSA, 
    32: r+skirtLength+saHem+seamAllowance+ cpSA, 
    24: r+skirtLength+saHem+seamAllowance+cpWaistNoSa, 
    25:r+skirtLength+saHem+seamAllowance+cbCp, 
    26: r+skirtLength+saHem+seamAllowance+cbCpSA,
    27: rHem+rSa+seamAllowance,
    271:rHem+rSa+seamAllowance, 
    28: rHem + r+seamAllowance,
    281: rHem + r+seamAllowance,
    29: rHem+ rCb+seamAllowance, 
    291: rHem+ rCb+seamAllowance,
    30: rHem+rCbSA+seamAllowance,
    301: rHem+rCbSA+seamAllowance, 


}

//Waist band length Calculations 

function waistBandLength(rSa, seamAllowance,ptConversion) {

    let c = 2*(Math.PI*(rSa));
    let totalWaistBand = ((seamAllowance*2)+c)/ptConversion; 



    return totalWaistBand.toFixed(2)

};

let totalWaistband = waistBandLength(rSa, seamAllowance,ptConversion);

//MARGIN FIX

function marginAdjustment(rCbSA, rOuterCircle,saHem) {

    let skirtLengthDifference = rCbSA-rOuterCircle; 


    if (Math.sign(skirtLengthDifference) === -1) {
       
       return (300+ ((-1*(rCbSA-rOuterCircle))+saHem));
    

      } else {

        return 300 - ((rCbSA-rOuterCircle)-saHem); 
      }; 
 

  };


  
  let marginAdj = marginAdjustment(rCbSA, rOuterCircle,saHem); 


//Take the coordinate object, separate the key/value pairs, turn the values into an array and apply the margin, then put the key/value pairs back together
function objectArray(obj,margin){
    let keys = Object.keys(obj);
    let values = Object.entries(obj); 

    let arr = []; 

    for (let i = 0; i < values.length; i++) {
        arr.push(values[i][1]+margin);

    }

    return Object.assign.apply({},keys.map((v,i)=> ({[v]: arr[i]})));

}

//This function adds 300 pointe margin on all points, so everything is shifted 300 points on the x-axis and 300 points on the y-axis
//Name of the object, ObjectArray(object, amount of points needed to add to object);


let marginWithAdj = marginAdj; // + marginAdj - This is to make sure that the points will always be positioned with a 300pt margin on left and right side, accounting for the difference in length between front and back skirt panel

let xCo = objectArray(xCordinates,marginWithAdj);
let yCo = objectArray(yCordinates,300);

let yCoBack = objectArray(yCordinates,550);
let yCpBack = objectArray(yControlPoints, 550);

let xCp = objectArray(xControlPoints, marginWithAdj); 
let yCp = objectArray(yControlPoints, 300); 


  
// -------------------------------------------------------------------------------------------------------------------------------------
//  START OF PDF KIT FORMATTING / CALCULATIONS  
// -------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------
//  PDF SIZE  FORMATTING 
// -------------------------------------------------------------------------------------------------------------------------------------

 function docWHCalc(waist,rdcRatio,backSkirtLength,skirtLength, saHem) {
    r = ((waist*rdcRatio)/(2*Math.PI));
    let width = 2*(skirtLength + r + saHem);
    let height = (2*(backSkirtLength+r+saHem+seamAllowance))+250;  
    return [width,height]

 }

 let docWidthHeight = docWHCalc(waist,rdcRatio,backSkirtLength,skirtLength, saHem); 




let docWidth = (docWidthHeight[0] + 600); //300pt margin on the left and right - ((hip/2)+600)
let docHeight = (docWidthHeight[1] + 1500); //600pt margin - (ntwCB+wtcCF+backGst+600)


const doc = new PDFDocument({size: [docWidth,docHeight]}); //format to set size to ISO standards {size: 'A7'}


// pipe the document to a blob

const stream = doc.pipe(blobStream());


// -------------------------------------------------------------------------------------------------------------------------------------
//  Text Inputs
// -------------------------------------------------------------------------------------------------------------------------------------



// -------------------------------------------------------------------------------------------------------------------------------------
//  VECTOR INPUT / DOC CONTENT 
// -------------------------------------------------------------------------------------------------------------------------------------
 

function vectorInput(xStart, yStart, xEnd, yEnd) {
    doc.moveTo(xStart, yStart) // set the current point
    .lineTo(xEnd, yEnd) // draw a line
    .stroke(); 
};

function curveInput(xStart, yStart, cp1x, cp1y, cp2x, cp2y, xEnd, yEnd) {
    doc.moveTo(xStart, yStart) // set the current point 
    .bezierCurveTo(cp1x, cp1y, cp2x, cp2y, xEnd, yEnd) // draw a bezier curve
    .stroke(); 
};




function guideLine(xStart, yStart, xEnd, yEnd) {
    doc.moveTo(xStart, yStart) // set the current point
    .lineTo(xEnd, yEnd) // draw a line
    .dash(5, 10)
    .stroke(); 
};

function curveInputDash(xStart, yStart, cp1x, cp1y, cp2x, cp2y, xEnd, yEnd) {
    doc.moveTo(xStart, yStart) // set the current point 
    .bezierCurveTo(cp1x, cp1y, cp2x, cp2y, xEnd, yEnd) // draw a bezier curve
    .dash(5, 10)
    .stroke(); 
};

// function vectorInputThick(xStart, yStart, xEnd, yEnd) {
//     doc.moveTo(xStart, yStart) // set the current point
//     .lineWidth(3)
//     .lineTo(xEnd, yEnd) // draw a line
//     .stroke(); 
// };

function vectorInputThin(xStart, yStart, xEnd, yEnd) {
    doc.moveTo(xStart, yStart) // set the current point
    .lineWidth(0.1)
    .lineTo(xEnd, yEnd) // draw a line
    .stroke(); 
};




//Hem Allowance Front Panel
curveInput(xCo[7], yCo[7],xCp[7], yCp[7], xCp[8], yCp[8], xCo[8], yCo[8]);
curveInput(xCo[8], yCo[8],xCp[81], yCp[81], xCp[9], yCp[9], xCo[9], yCo[9]);

//Seam Allowance 
vectorInput(xCo[7],yCo[7],xCo[10],yCo[10]);
vectorInput(xCo[10],yCo[10],xCo[15],yCo[15]);
vectorInput(xCo[16],yCo[16],xCo[14],yCo[14]);
vectorInput(xCo[9],yCo[9],xCo[14],yCo[14]);
vectorInput(xCo[11],yCo[11],xCo[15],yCo[15]);
vectorInput(xCo[13],yCo[13],xCo[16],yCo[16]);


// Back Panel 

vectorInput(xCo[26],yCoBack[26],xCo[36],yCoBack[36]);
vectorInput(xCo[36],yCoBack[36],xCo[35],yCoBack[35]);
vectorInput(xCo[35],yCoBack[35],xCo[32],yCoBack[32]);
vectorInput(xCo[21],yCoBack[21],xCo[33],yCoBack[33]);
vectorInput(xCo[33],yCoBack[33],xCo[34],yCoBack[34]);
vectorInput(xCo[34],yCoBack[34],xCo[31],yCoBack[31]);






//Front Skirt Panel - Waist Seam Allowance 
curveInput(xCo[11], yCo[11],xCp[11], yCp[11], xCp[12], yCp[12], xCo[12], yCo[12]);
curveInput(xCo[12], yCo[12],xCp[121], yCp[121], xCp[13], yCp[13], xCo[13], yCo[13]);

//Back Skirt Panel 
//Back Skirt Panel - Hem Allowance
curveInput(xCo[21], yCoBack[21],xCp[21], yCpBack[21], xCp[30], yCpBack[30], xCo[30], yCoBack[30]); 
curveInput(xCo[30], yCoBack[30],xCp[301], yCpBack[301], xCp[26], yCpBack[26], xCo[26], yCoBack[26]); 



//Back Skirt Panel - Waist Seam Allowance
curveInput(xCo[31], yCoBack[31],xCp[31], yCpBack[31], xCp[27], yCpBack[27], xCo[27], yCoBack[27]); 
curveInput(xCo[27], yCoBack[27],xCp[271], yCpBack[271], xCp[32], yCpBack[32], xCo[32], yCoBack[32]); 



//Center Guideline 
vectorInputThin(xCo[8], yCo[8], xCo[12], yCo[12]); 
vectorInputThin(xCo[27], yCoBack[27], xCo[30], yCoBack[30]); 

//Front Panel 
//Main Pattern
guideLine(xCo[1],yCo[1],xCo[2],yCo[2]);
guideLine(xCo[3],yCo[3],xCo[4],yCo[4]);

// Back Panel - Main Pattern No SA
guideLine(xCo[22],yCoBack[22],xCo[23],yCoBack[23]);
guideLine(xCo[24],yCoBack[24],xCo[25],yCoBack[25]);

// Front Panel - Main Pattern - No Seam Allowance 
curveInputDash(xCo[1], yCo[1],xCp[1], yCp[1], xCp[5], yCp[5], xCo[5], yCo[5]); 
curveInputDash(xCo[5], yCo[5],xCp[51], yCp[51], xCp[4], yCp[4], xCo[4], yCo[4]); 

//Inner Waist Circle
curveInputDash(xCo[2], yCo[2],xCp[2], yCp[2], xCp[6], yCp[6], xCo[6], yCo[6]); 
curveInputDash(xCo[6], yCo[6],xCp[61], yCp[61], xCp[3], yCp[3], xCo[3], yCo[3]); 


//Bezier Curves - Back Panel 
//Back Skirt Panel - Outer Circle - No Seam Allowance
curveInputDash(xCo[22], yCoBack[22],xCp[22], yCpBack[22], xCp[29], yCpBack[29], xCo[29], yCoBack[29]); 
curveInputDash(xCo[29], yCoBack[29],xCp[291], yCpBack[291], xCp[25], yCpBack[25], xCo[25], yCoBack[25]); 

//Back Skirt Panel - Waist Seam Allowance
//Inner Waist Circle
curveInputDash(xCo[23], yCoBack[23],xCp[23], yCpBack[23], xCp[28], yCpBack[28], xCo[28], yCoBack[28]); 
curveInputDash(xCo[28], yCoBack[28],xCp[281], yCpBack[281], xCp[24], yCpBack[24], xCo[24], yCoBack[24]); 





//-------------------------------------------------------------------------------------------------------------------------------------
//  END OF DOC - GET BLOB WHEN YOU'RE DONE
// -------------------------------------------------------------------------------------------------------------------------------------
 
// Finalize the document
doc.end(); // Finalize the document

let downloadButton = document.getElementById('pdf');
downloadButton.addEventListener('click', download);

const a = document.createElement("a");
document.body.appendChild(a);
a.style = "display: none";

let blob;
let blobUrl;

function download() {
    if (!blob) return;
    if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    blobUrl = window.URL.createObjectURL(blob);
    a.href = blobUrl;
    a.download = 'MiSlope Tiled Circle Skirt Pattern.pdf';
    a.click();
}

stream.on('finish', async function () {
    try {
        blob = stream.toBlob("application/pdf");
        const arrayBuffer = await blob.arrayBuffer();
        const tiledPdfBytes = await tilePDF(arrayBuffer);
        const tiledBlob = new Blob([tiledPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(tiledBlob);
        const element = document.getElementById('pdf');
        element.setAttribute('href', url);
        console.log('Tiled PDF is ready for download:', url);

        // Form Validation
        const isValid = Array.from(form.elements).filter(el => el.value === '').length === 0;
        const radioValid = Array.from(form.elements.units).some(el => el.checked);
        element.style.display = isValid && radioValid ? 'block' : 'none';
    } catch (error) {
        console.error('Error in processing PDF:', error);
    }
});
}
 