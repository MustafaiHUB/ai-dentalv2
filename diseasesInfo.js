'use strict';

// Selectors
const modelTitle = document.querySelector('.model-title');
const uploadedImageContainer = document.querySelector('.uploaded-image');
const choosingModels = document.querySelector('.choosing-models');
const diseasesList = document.querySelector('.list-diseases');
const allDiseasesInput = document.getElementById('all');
const diseasesMenuList = document.querySelector('.body');
const places = document.querySelectorAll('.place');
const checkboxInput = document.querySelectorAll('.list-diseases input[type="checkbox"]');
const currentImage = document.querySelector('.current-img');
const uploadInput = document.getElementById('upload-input');
const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const bonelossDiv = document.querySelector('.boneloss-div');
const bonelossInput = document.getElementById('boneloss');
const imageNotStandardError = document.querySelector('.image_standard_error');

const bonelossOverlay = document.querySelector('.overlay-boneloss');
const closeBonelossOverlay = document.querySelector('.close');
const showBonelossSelect = document.getElementById('show_Boneloss');

// Global Variables
let imageWidth;
let imageHeight;
let orientationStatus = 0;
let pointsList = [];
let points = {};
let bonelossPoints;
let imageIsNotStandardFlag = false;
let showBoneloss;

// console.log(showBonelossSelect.value)
// Functions
closeBonelossOverlay.addEventListener('click', function () {
    bonelossOverlay.classList.add('hide')
})

showBonelossSelect.addEventListener('change', function (e) {
    showBoneloss = e.target.value;
    console.log(showBoneloss)
    bonelossOverlay.classList.add('hide')
    // console.log(typeof e.target.value)
})

uploadInput.addEventListener('change', changeInput);
function setTimeOut(sec) {
    return new Promise(function (_, reject) {
        setTimeout(() => {
            reject(new Error('Process took too long, please try again!'));
        }, sec * 1000);
    });
}

function clearInput() {
    choosingModels.innerHTML = '';
}

function generateDiseasePlace(color = '', diseaseName, topCoords, leftCoords, score, width, height) {
    const html = `
    <div score="${score}%" disease-name="${diseaseName}" class="place ${color}" style="top: ${topCoords}px; left: ${leftCoords}px; width: ${width}px; height: ${height}px; display: block;" data-value="${diseaseName}"></div>
    `;
    choosingModels.insertAdjacentHTML('beforeend', html);
}

function generateDiseaseLines(color = '', topCoords, leftCoords, width, height) {
    const html = `
    <div class="boneloss-point" style="top: ${topCoords}px; left: ${leftCoords}px; width: ${width}px; height: ${height}px; display: block;background-color: ${color}"></div>
    `;
    choosingModels.insertAdjacentHTML('beforeend', html);
}

const modifyImage = async function (originalFile, originalName) {
    const originalContent = await originalFile.arrayBuffer();
    // Create a new Blob with the modified content
    const modifiedBlob = new Blob([originalContent], { type: `image/png` });

    // Create large number
    const lagreRandomNumber = Math.trunc(Math.random() * 100000);
    console.log(lagreRandomNumber);

    // Create a new File object with the modified Blob and name
    const modifiedFile = new File([modifiedBlob], `${lagreRandomNumber}.png`, { lastModified: originalFile.lastModified, type: `image/png` });

    // Trigger the download
    // downloadLink.click();

    return modifiedFile;
}

async function changeInput(e) {
    e.preventDefault();
    clearInput();
    imageIsNotStandardFlag = false;
    canvas.style.display = 'none'
    imageNotStandardError.classList.add('hidden');
    showBonelossSelect.value = 'empty'
    bonelossInput.checked = false;
    // Reset checked input to fasle
    checkboxInput.forEach(input => {
        input.checked = false;
        input.removeAttribute('disabled');
        input.closest('div').style.opacity = 1;
    });
    diseasesList.classList.add('hidden');
    currentImage.classList.remove('hidden');
    // Hide BoneLoss Div
    bonelossDiv.classList.add('hidden')
    // Getting the file information
    const imageFile = e.target.files[0];
    const imageName = imageFile.name;

    // Set loading until getting the data
    const loadingHTML = `
    <section class="dots-container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    </section>
    `;
    choosingModels.insertAdjacentHTML('beforeend', loadingHTML);

    const file = await modifyImage(imageFile, imageName);

    currentImage.setAttribute('src', URL.createObjectURL(file));
    JSONcall1(file);
}

// Show / Hide boneloss
bonelossInput.addEventListener('click', (e) => {
    const { checked } = e.target;

    console.log(checked)
    if (showBoneloss === 'yes') {
        if (checked) {
            canvas.style.display = 'block'
            bonelossPoints.forEach(point => point.style.opacity = '1')
        } else {
            canvas.style.display = 'none'
            bonelossPoints.forEach(point => point.style.opacity = '0')
        }
    } else {
        if (checked) {
            canvas.style.display = 'block'
            drawLinesShowHide(pointsList)
            bonelossPoints.forEach(point => point.style.opacity = '1')
        } else {
            canvas.style.display = 'none'
            // drawLinesShowHide(pointsList)
            bonelossPoints.forEach(point => point.style.opacity = '0')
        }
    }
})

// Draw lines function
function drawLines(pointArray, color, lineLenght) {
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.font = '20px bold Arial';
    context.fillStyle = color;

    for (let i = 0; i < pointArray.length; i += 2) {
        if (i + 1 < pointArray.length) {
            let start = pointArray[i];
            let end = pointArray[i + 1];
            let length = start.length;  // Retrieve the length from the start point

            context.beginPath();
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
            context.stroke();

            // Calculate mid-point for placing the text
            let midX = (start.x + end.x) / 1.97;
            let midY = (start.y + end.y) / 1.9;

            // Draw the length beside the line
            context.fillText(lineLenght + "mm", midX, midY);
        }
    }
}

async function JSONcall1(imageFile) {
    const formData = new FormData();
    console.log(imageFile);
    formData.append("image", imageFile);

    try {
        const res = await Promise.race([fetch('https://dentalvision.ju.edu.jo/upload/', {
            mode: 'cors',
            method: 'POST',
            body: formData,
        }), setTimeOut(120)]);

        console.log(res);
        console.log("Done with upload");

        if (!res.ok) {
            console.log(res);
            clearInput();
            const noDiseaseHTML = `
                <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
            `;
            choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
        } else {
            const data = await res.json();
            console.log(data.orientation);
            orientationStatus = data.orientation;
            JSONcall3(imageFile);
        }
    } catch (err) {
        clearInput();
        const noDiseaseHTML = `
            <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
        `;
        choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
    }
}

// Returns list of points (Lines)
// async function JSONcall2(imageFile) {
//     try {
//         const res = await Promise.race([fetch('https://dentalvision.ju.edu.jo/v8_mohammadBL/', {
//             mode: 'cors',
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 "filename": imageFile.name
//             }),
//         }), setTimeOut(120)]);

//         console.log(res);
//         console.log("done with BL");

//         if (!res.ok) {
//             clearInput();
//             const noDiseaseHTML = `
//                 <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
//             `;
//             choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
//         } else {
//             const data = await res.json();
//             pointsList = data;
//             console.log(pointsList);
//             JSONcall3(imageFile);
//         }
//     } catch (err) {
//         clearInput();
//         const noDiseaseHTML = `
//             <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
//         `;
//         choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
//     }
// }

// Returns list of boxes

async function JSONcall3(imageFile) {
    try {
        const res = await Promise.race([fetch('https://dentalvision.ju.edu.jo/v8_mohammad/', {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "filename": imageFile.name
            }),
        }), setTimeOut(120)]);

        console.log(res);
        console.log("done with v8");

        if (!res.ok) {
            clearInput();
            const noDiseaseHTML = `
                <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
            `;
            choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
        } else {
            const data = await res.json();
            console.log("data", data);
            const numberOfDiseases = data.length;
            console.log(data.length);

            if (!numberOfDiseases) {
                console.log("Number of diseases is zero");
                clearInput();
                const imageHTML = `
                    <img
                    class="selected-image"
                    src="${URL.createObjectURL(imageFile)}"
                    alt="Tooth Vision"
                />
                `;
                choosingModels.insertAdjacentHTML('beforeend', imageHTML);
                currentImage.classList.add('hidden');
            }
            // else {
            console.log(data);
            clearInput();
            const imageHTML = `
                    <img
                    class="selected-image"
                    src="${URL.createObjectURL(imageFile)}"
                    alt="Tooth Vision"
                />
                `;
            choosingModels.insertAdjacentHTML('beforeend', imageHTML);

            // // Show BoneLoss Div
            // bonelossDiv.classList.remove('hidden')

            const selectedImage = document.querySelector('.selected-image');

            console.log(selectedImage);
            selectedImage.addEventListener('load', function (e) {
                console.log(e);
                console.log(selectedImage.width);
                imageWidth = +selectedImage.getClientRects()[0].width; // Convert string to number by using the + operator at the biggening
                imageHeight = +selectedImage.getClientRects()[0].height;

                // console.log(pointsList);

                // for (const eachPoint of pointsList) {
                //     console.log(eachPoint);
                //     const { leftBorderRootFlag } = eachPoint;
                //     const { rightBorderRootFlag } = eachPoint;
                //     const { BoneLeft } = eachPoint;
                //     const { BoneRight } = eachPoint;
                //     const { CejLeft } = eachPoint;
                //     const { CejRight } = eachPoint;
                //     const { CejLeftLength } = eachPoint;
                //     const { CejRightLength } = eachPoint;

                //     const IsCejLeftNegative = CejLeft[0] < 0 || CejLeft[1] < 0
                //     const IsCejRightNegative = CejRight[0] < 0 || CejRight[1] < 0

                //     console.log(IsCejLeftNegative)
                //     console.log(IsCejRightNegative)

                //     if (leftBorderRootFlag === 1 || rightBorderRootFlag === 1 || IsCejLeftNegative || IsCejRightNegative) {
                //         console.log("returned");
                //         continue;
                //     }
                //     if (leftBorderRootFlag === 2 && rightBorderRootFlag === 2) {
                //         console.log("image is not standard error!");
                //         imageIsNotStandardFlag = true;
                //     }
                //     console.log("continue");
                //     console.log(eachPoint);

                //     console.log("BoneLeft: " + BoneLeft, "BoneRight: " + BoneRight, "CejLeft: " + CejLeft, "CejRight: " + CejRight);
                //     // function generateDiseaseLines(color = '', topCoords, leftCoords, width, height)
                //     if (orientationStatus === '90c') {
                //         generateDiseaseLines('red', imageHeight - (CejLeft[0] * imageHeight), CejLeft[1] * imageWidth, 15, 15)
                //         generateDiseaseLines('red', imageHeight - (BoneLeft[0] * imageHeight), BoneLeft[1] * imageWidth, 15, 15)

                //         generateDiseaseLines('blue', imageHeight - (CejRight[0] * imageHeight), CejRight[1] * imageWidth, 15, 15)
                //         generateDiseaseLines('blue', imageHeight - (BoneRight[0] * imageHeight), BoneRight[1] * imageWidth, 15, 15)

                //         // Points data
                //         points = {
                //             red: [
                //                 { y: imageHeight - (CejLeft[0] * imageHeight), x: CejLeft[1] * imageWidth },
                //                 { y: imageHeight - (BoneLeft[0] * imageHeight), x: BoneLeft[1] * imageWidth },
                //             ],
                //             blue: [
                //                 { y: imageHeight - (CejRight[0] * imageHeight), x: CejRight[1] * imageWidth },
                //                 { y: imageHeight - (BoneRight[0] * imageHeight), x: BoneRight[1] * imageWidth },
                //             ]
                //         };
                //     } else if (orientationStatus === '90cc') {
                //         generateDiseaseLines('red', CejLeft[0] * imageHeight, imageWidth - (CejLeft[1] * imageWidth), 15, 15)
                //         generateDiseaseLines('red', BoneLeft[0] * imageHeight, imageWidth - (BoneLeft[1] * imageWidth), 15, 15)

                //         generateDiseaseLines('blue', CejRight[0] * imageHeight, imageWidth - (CejRight[1] * imageWidth), 15, 15)
                //         generateDiseaseLines('blue', BoneRight[0] * imageHeight, imageWidth - (BoneRight[1] * imageWidth), 15, 15)

                //         // Points data
                //         points = {
                //             red: [
                //                 { y: CejLeft[0] * imageHeight, x: imageWidth - (CejLeft[1] * imageWidth) },
                //                 { y: BoneLeft[0] * imageHeight, x: imageWidth - (BoneLeft[1] * imageWidth) },
                //             ],
                //             blue: [
                //                 { y: CejRight[0] * imageHeight, x: imageWidth - (CejRight[1] * imageWidth) },
                //                 { y: BoneRight[0] * imageHeight, x: imageWidth - (BoneRight[1] * imageWidth) },
                //             ]
                //         };
                //     } else if (orientationStatus === '180') {
                //         generateDiseaseLines('red', imageHeight - (CejLeft[1] * imageHeight), CejLeft[0] * imageWidth, 15, 15)
                //         generateDiseaseLines('red', imageHeight - (BoneLeft[1] * imageHeight), BoneLeft[0] * imageWidth, 15, 15)

                //         generateDiseaseLines('blue', imageHeight - (CejRight[1] * imageHeight), CejRight[0] * imageWidth, 15, 15)
                //         generateDiseaseLines('blue', imageHeight - (BoneRight[1] * imageHeight), BoneRight[0] * imageWidth, 15, 15)

                //         // Points data
                //         points = {
                //             red: [
                //                 { y: imageHeight - (CejLeft[1] * imageHeight), x: CejLeft[0] * imageWidth },
                //                 { y: imageHeight - (BoneLeft[1] * imageHeight), x: BoneLeft[0] * imageWidth },
                //             ],
                //             blue: [
                //                 { y: imageHeight - (CejRight[1] * imageHeight), x: CejRight[0] * imageWidth },
                //                 { y: imageHeight - (BoneRight[1] * imageHeight), x: BoneRight[0] * imageWidth },
                //             ]
                //         };
                //     } else {
                //         generateDiseaseLines('red', CejLeft[1] * imageHeight, CejLeft[0] * imageWidth, 15, 15)
                //         generateDiseaseLines('red', BoneLeft[1] * imageHeight, BoneLeft[0] * imageWidth, 15, 15)

                //         generateDiseaseLines('blue', CejRight[1] * imageHeight, CejRight[0] * imageWidth, 15, 15)
                //         generateDiseaseLines('blue', BoneRight[1] * imageHeight, BoneRight[0] * imageWidth, 15, 15)

                //         // Points data
                //         points = {
                //             red: [
                //                 { y: CejLeft[1] * imageHeight, x: CejLeft[0] * imageWidth },
                //                 { y: BoneLeft[1] * imageHeight, x: BoneLeft[0] * imageWidth },
                //             ],
                //             blue: [
                //                 { y: CejRight[1] * imageHeight, x: CejRight[0] * imageWidth },
                //                 { y: BoneRight[1] * imageHeight, x: BoneRight[0] * imageWidth },
                //             ]
                //         };
                //     }

                //     console.log(points.red);
                //     console.log(points.blue);
                //     console.log(Math.trunc(CejLeftLength));
                //     // Draw red lines
                //     drawLines(points.red, "red", Math.trunc(CejLeftLength));
                //     // Draw blue lines
                //     drawLines(points.blue, "blue", Math.trunc(CejRightLength));

                // }
                // console.log("continue");
                // if (imageIsNotStandardFlag) {
                //     canvas.style.display = 'none';
                //     // Hide BoneLoss Div
                //     bonelossDiv.classList.add('hidden');
                //     // Show the error
                //     imageNotStandardError.classList.remove('hidden');
                // }
                for (const eachBox of data) {
                    console.log("continue");

                    const { box } = eachBox;
                    console.log(box);
                    console.log(eachBox);

                    // =========================== DRAWING BOXES
                    const type = eachBox.cls;
                    const { score } = eachBox;
                    console.log(checkboxInput);
                    console.log(checkboxInput[type]);
                    const diseaseColorInput = checkboxInput[type].dataset.color;
                    console.log(diseaseColorInput);
                    const nameOfDisease = checkboxInput[type].dataset.diseaseName;
                    checkboxInput[type].checkVisibility = true;
                    checkboxInput[type].checked = true;

                    // why is it undefined?
                    console.log(imageHeight, imageWidth);
                    // function generateDiseasePlace(color = '', diseaseName, topCoords, leftCoords, score, width, height)
                    if (orientationStatus === '90cc') {
                        console.log("90cc image");

                        // Working
                        generateDiseasePlace(diseaseColorInput, nameOfDisease, box[1] * imageHeight, imageWidth - box[2] * imageWidth, (score * 100).toFixed(1), (box[2] - box[0]) * imageWidth, (box[3] - box[1]) * imageHeight);
                    } else if (orientationStatus === '90c') {
                        console.log("90c image");

                        //Working
                        generateDiseasePlace(diseaseColorInput, nameOfDisease, imageHeight - box[3] * imageHeight, box[0] * imageWidth, (score * 100).toFixed(1), (box[2] - box[0]) * imageWidth, (box[3] - box[1]) * imageHeight);

                    } else if (orientationStatus === '180') {
                        console.log("180 image");

                        generateDiseasePlace(diseaseColorInput, nameOfDisease, imageHeight - box[2] * imageHeight, box[1] * imageWidth, (score * 100).toFixed(1), Math.abs(box[3] - box[1]) * imageWidth, Math.abs(box[2] - box[0]) * imageHeight);
                    } else { // default
                        console.log("0 image");

                        generateDiseasePlace(diseaseColorInput, nameOfDisease, box[0] * imageHeight, box[1] * imageWidth, (score * 100).toFixed(1), Math.abs(box[3] - box[1]) * imageWidth, Math.abs(box[2] - box[0]) * imageHeight);
                    }
                    // =========================== DRAWING BOXES
                }
                // Get all places that were created
                const diseasesPlaces = document.querySelectorAll('.place');
                // bonelossPoints = document.querySelectorAll('.boneloss-point');

                // Convert them to an array
                const places = Array.from(diseasesPlaces);
                console.log(places);

                // Getting the name of diseases
                const diseases = [];
                places.forEach(place => {
                    const value = place.dataset.value;
                    diseases.push(value);
                })
                console.log(diseases);

                // Disable the inputs that not in the diseases
                checkboxInput.forEach(input => {
                    if (input.value !== diseases[0] && !diseases.includes(input.value)) {
                        input.setAttribute("disabled", "disabled");
                        input.closest('div').style.opacity = '0.2';
                    }
                })

                // Select to display box with the same disease name
                function selectBox(e) {
                    const targetEl = e.target.closest('.disease');
                    if (!targetEl) return;
                    const targetValue = targetEl.value;
                    const placeEl = places.find(el => el.attributes[4].value === targetValue);

                    places.filter(el => el.attributes[4].value === targetValue).map(el => {
                        if (targetEl.checked) {
                            el.style.display = 'block';
                        } else {
                            el.style.display = 'none';
                        }
                    });
                    if (targetEl.checked) {
                        placeEl.style.display = 'block';
                    } else {
                        placeEl.style.display = 'none';
                    }
                }
                diseasesList.addEventListener('click', selectBox);
                diseasesList.classList.remove('hidden');
                currentImage.classList.add('hidden');
            })
            bonelossOverlay.classList.remove('hide')
            JSONcall4(imageFile)
            // }
        }
    } catch (err) {
        clearInput();
        const noDiseaseHTML = `
            <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
        `;
        choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
    }
}

function drawLinesShowHide(pointsList) {
    for (const eachPoint of pointsList) {
        console.log(eachPoint);
        const { leftBorderRootFlag } = eachPoint;
        const { rightBorderRootFlag } = eachPoint;
        const { BoneLeft } = eachPoint;
        const { BoneRight } = eachPoint;
        const { CejLeft } = eachPoint;
        const { CejRight } = eachPoint;
        const { CejLeftLength } = eachPoint;
        const { CejRightLength } = eachPoint;

        const IsCejLeftNegative = CejLeft[0] < 0 || CejLeft[1] < 0
        const IsCejRightNegative = CejRight[0] < 0 || CejRight[1] < 0

        console.log(IsCejLeftNegative)
        console.log(IsCejRightNegative)

        if (leftBorderRootFlag === 1 || rightBorderRootFlag === 1 || IsCejLeftNegative || IsCejRightNegative) {
            console.log("returned");
            continue;
        }
        if (leftBorderRootFlag === 2 && rightBorderRootFlag === 2) {
            console.log("image is not standard error!");
            imageIsNotStandardFlag = true;
        }
        console.log("continue");
        console.log(eachPoint);

        console.log("BoneLeft: " + BoneLeft, "BoneRight: " + BoneRight, "CejLeft: " + CejLeft, "CejRight: " + CejRight);
        // function generateDiseaseLines(color = '', topCoords, leftCoords, width, height)
        if (orientationStatus === '90c') {
            generateDiseaseLines('red', imageHeight - (CejLeft[0] * imageHeight), CejLeft[1] * imageWidth, 15, 15)
            generateDiseaseLines('red', imageHeight - (BoneLeft[0] * imageHeight), BoneLeft[1] * imageWidth, 15, 15)

            generateDiseaseLines('blue', imageHeight - (CejRight[0] * imageHeight), CejRight[1] * imageWidth, 15, 15)
            generateDiseaseLines('blue', imageHeight - (BoneRight[0] * imageHeight), BoneRight[1] * imageWidth, 15, 15)

            // Points data
            points = {
                red: [
                    { y: imageHeight - (CejLeft[0] * imageHeight), x: CejLeft[1] * imageWidth },
                    { y: imageHeight - (BoneLeft[0] * imageHeight), x: BoneLeft[1] * imageWidth },
                ],
                blue: [
                    { y: imageHeight - (CejRight[0] * imageHeight), x: CejRight[1] * imageWidth },
                    { y: imageHeight - (BoneRight[0] * imageHeight), x: BoneRight[1] * imageWidth },
                ]
            };
        } else if (orientationStatus === '90cc') {
            generateDiseaseLines('red', CejLeft[0] * imageHeight, imageWidth - (CejLeft[1] * imageWidth), 15, 15)
            generateDiseaseLines('red', BoneLeft[0] * imageHeight, imageWidth - (BoneLeft[1] * imageWidth), 15, 15)

            generateDiseaseLines('blue', CejRight[0] * imageHeight, imageWidth - (CejRight[1] * imageWidth), 15, 15)
            generateDiseaseLines('blue', BoneRight[0] * imageHeight, imageWidth - (BoneRight[1] * imageWidth), 15, 15)

            // Points data
            points = {
                red: [
                    { y: CejLeft[0] * imageHeight, x: imageWidth - (CejLeft[1] * imageWidth) },
                    { y: BoneLeft[0] * imageHeight, x: imageWidth - (BoneLeft[1] * imageWidth) },
                ],
                blue: [
                    { y: CejRight[0] * imageHeight, x: imageWidth - (CejRight[1] * imageWidth) },
                    { y: BoneRight[0] * imageHeight, x: imageWidth - (BoneRight[1] * imageWidth) },
                ]
            };
        } else if (orientationStatus === '180') {
            generateDiseaseLines('red', imageHeight - (CejLeft[1] * imageHeight), CejLeft[0] * imageWidth, 15, 15)
            generateDiseaseLines('red', imageHeight - (BoneLeft[1] * imageHeight), BoneLeft[0] * imageWidth, 15, 15)

            generateDiseaseLines('blue', imageHeight - (CejRight[1] * imageHeight), CejRight[0] * imageWidth, 15, 15)
            generateDiseaseLines('blue', imageHeight - (BoneRight[1] * imageHeight), BoneRight[0] * imageWidth, 15, 15)

            // Points data
            points = {
                red: [
                    { y: imageHeight - (CejLeft[1] * imageHeight), x: CejLeft[0] * imageWidth },
                    { y: imageHeight - (BoneLeft[1] * imageHeight), x: BoneLeft[0] * imageWidth },
                ],
                blue: [
                    { y: imageHeight - (CejRight[1] * imageHeight), x: CejRight[0] * imageWidth },
                    { y: imageHeight - (BoneRight[1] * imageHeight), x: BoneRight[0] * imageWidth },
                ]
            };
        } else {
            generateDiseaseLines('red', CejLeft[1] * imageHeight, CejLeft[0] * imageWidth, 15, 15)
            generateDiseaseLines('red', BoneLeft[1] * imageHeight, BoneLeft[0] * imageWidth, 15, 15)

            generateDiseaseLines('blue', CejRight[1] * imageHeight, CejRight[0] * imageWidth, 15, 15)
            generateDiseaseLines('blue', BoneRight[1] * imageHeight, BoneRight[0] * imageWidth, 15, 15)

            // Points data
            points = {
                red: [
                    { y: CejLeft[1] * imageHeight, x: CejLeft[0] * imageWidth },
                    { y: BoneLeft[1] * imageHeight, x: BoneLeft[0] * imageWidth },
                ],
                blue: [
                    { y: CejRight[1] * imageHeight, x: CejRight[0] * imageWidth },
                    { y: BoneRight[1] * imageHeight, x: BoneRight[0] * imageWidth },
                ]
            };
        }

        console.log(points.red);
        console.log(points.blue);
        console.log(Math.trunc(CejLeftLength));
        // Draw red lines
        drawLines(points.red, "red", Math.trunc(CejLeftLength));
        // Draw blue lines
        drawLines(points.blue, "blue", Math.trunc(CejRightLength));

    }
    bonelossPoints = document.querySelectorAll('.boneloss-point');
    console.log("continue");
    if (imageIsNotStandardFlag) {
        canvas.style.display = 'none';
        // Hide BoneLoss Div
        bonelossDiv.classList.add('hidden');
        // Show the error
        imageNotStandardError.classList.remove('hidden');
    }
}
// Returns list of points (Lines)
async function JSONcall4(imageFile) {
    try {
        const res = await Promise.race([fetch('https://dentalvision.ju.edu.jo/v8_mohammadBL/', {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "filename": imageFile.name
            }),
        }), setTimeOut(120)]);

        console.log(res);
        console.log("done with BL");

        if (!res.ok) {
            clearInput();
            const noDiseaseHTML = `
                <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
            `;
            choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
        } else {
            const data = await res.json();
            pointsList = data;
            console.log(pointsList);


            canvas.style.display = 'block'
            canvas.setAttribute('width', imageWidth);
            canvas.setAttribute('height', imageHeight);

            // Show BoneLoss Div
            bonelossDiv.classList.remove('hidden')

            if (showBoneloss === 'yes') {
                drawLinesShowHide(pointsList)
                bonelossInput.checked = true;
            } else {
                bonelossInput.checked = false;
            }

            // if (showBoneloss === 'yes') {
            // for (const eachPoint of pointsList) {
            //     console.log(eachPoint);
            //     const { leftBorderRootFlag } = eachPoint;
            //     const { rightBorderRootFlag } = eachPoint;
            //     const { BoneLeft } = eachPoint;
            //     const { BoneRight } = eachPoint;
            //     const { CejLeft } = eachPoint;
            //     const { CejRight } = eachPoint;
            //     const { CejLeftLength } = eachPoint;
            //     const { CejRightLength } = eachPoint;

            //     const IsCejLeftNegative = CejLeft[0] < 0 || CejLeft[1] < 0
            //     const IsCejRightNegative = CejRight[0] < 0 || CejRight[1] < 0

            //     console.log(IsCejLeftNegative)
            //     console.log(IsCejRightNegative)

            //     if (leftBorderRootFlag === 1 || rightBorderRootFlag === 1 || IsCejLeftNegative || IsCejRightNegative) {
            //         console.log("returned");
            //         continue;
            //     }
            //     if (leftBorderRootFlag === 2 && rightBorderRootFlag === 2) {
            //         console.log("image is not standard error!");
            //         imageIsNotStandardFlag = true;
            //     }
            //     console.log("continue");
            //     console.log(eachPoint);

            //     console.log("BoneLeft: " + BoneLeft, "BoneRight: " + BoneRight, "CejLeft: " + CejLeft, "CejRight: " + CejRight);
            //     // function generateDiseaseLines(color = '', topCoords, leftCoords, width, height)
            //     if (orientationStatus === '90c') {
            //         generateDiseaseLines('red', imageHeight - (CejLeft[0] * imageHeight), CejLeft[1] * imageWidth, 15, 15)
            //         generateDiseaseLines('red', imageHeight - (BoneLeft[0] * imageHeight), BoneLeft[1] * imageWidth, 15, 15)

            //         generateDiseaseLines('blue', imageHeight - (CejRight[0] * imageHeight), CejRight[1] * imageWidth, 15, 15)
            //         generateDiseaseLines('blue', imageHeight - (BoneRight[0] * imageHeight), BoneRight[1] * imageWidth, 15, 15)

            //         // Points data
            //         points = {
            //             red: [
            //                 { y: imageHeight - (CejLeft[0] * imageHeight), x: CejLeft[1] * imageWidth },
            //                 { y: imageHeight - (BoneLeft[0] * imageHeight), x: BoneLeft[1] * imageWidth },
            //             ],
            //             blue: [
            //                 { y: imageHeight - (CejRight[0] * imageHeight), x: CejRight[1] * imageWidth },
            //                 { y: imageHeight - (BoneRight[0] * imageHeight), x: BoneRight[1] * imageWidth },
            //             ]
            //         };
            //     } else if (orientationStatus === '90cc') {
            //         generateDiseaseLines('red', CejLeft[0] * imageHeight, imageWidth - (CejLeft[1] * imageWidth), 15, 15)
            //         generateDiseaseLines('red', BoneLeft[0] * imageHeight, imageWidth - (BoneLeft[1] * imageWidth), 15, 15)

            //         generateDiseaseLines('blue', CejRight[0] * imageHeight, imageWidth - (CejRight[1] * imageWidth), 15, 15)
            //         generateDiseaseLines('blue', BoneRight[0] * imageHeight, imageWidth - (BoneRight[1] * imageWidth), 15, 15)

            //         // Points data
            //         points = {
            //             red: [
            //                 { y: CejLeft[0] * imageHeight, x: imageWidth - (CejLeft[1] * imageWidth) },
            //                 { y: BoneLeft[0] * imageHeight, x: imageWidth - (BoneLeft[1] * imageWidth) },
            //             ],
            //             blue: [
            //                 { y: CejRight[0] * imageHeight, x: imageWidth - (CejRight[1] * imageWidth) },
            //                 { y: BoneRight[0] * imageHeight, x: imageWidth - (BoneRight[1] * imageWidth) },
            //             ]
            //         };
            //     } else if (orientationStatus === '180') {
            //         generateDiseaseLines('red', imageHeight - (CejLeft[1] * imageHeight), CejLeft[0] * imageWidth, 15, 15)
            //         generateDiseaseLines('red', imageHeight - (BoneLeft[1] * imageHeight), BoneLeft[0] * imageWidth, 15, 15)

            //         generateDiseaseLines('blue', imageHeight - (CejRight[1] * imageHeight), CejRight[0] * imageWidth, 15, 15)
            //         generateDiseaseLines('blue', imageHeight - (BoneRight[1] * imageHeight), BoneRight[0] * imageWidth, 15, 15)

            //         // Points data
            //         points = {
            //             red: [
            //                 { y: imageHeight - (CejLeft[1] * imageHeight), x: CejLeft[0] * imageWidth },
            //                 { y: imageHeight - (BoneLeft[1] * imageHeight), x: BoneLeft[0] * imageWidth },
            //             ],
            //             blue: [
            //                 { y: imageHeight - (CejRight[1] * imageHeight), x: CejRight[0] * imageWidth },
            //                 { y: imageHeight - (BoneRight[1] * imageHeight), x: BoneRight[0] * imageWidth },
            //             ]
            //         };
            //     } else {
            //         generateDiseaseLines('red', CejLeft[1] * imageHeight, CejLeft[0] * imageWidth, 15, 15)
            //         generateDiseaseLines('red', BoneLeft[1] * imageHeight, BoneLeft[0] * imageWidth, 15, 15)

            //         generateDiseaseLines('blue', CejRight[1] * imageHeight, CejRight[0] * imageWidth, 15, 15)
            //         generateDiseaseLines('blue', BoneRight[1] * imageHeight, BoneRight[0] * imageWidth, 15, 15)

            //         // Points data
            //         points = {
            //             red: [
            //                 { y: CejLeft[1] * imageHeight, x: CejLeft[0] * imageWidth },
            //                 { y: BoneLeft[1] * imageHeight, x: BoneLeft[0] * imageWidth },
            //             ],
            //             blue: [
            //                 { y: CejRight[1] * imageHeight, x: CejRight[0] * imageWidth },
            //                 { y: BoneRight[1] * imageHeight, x: BoneRight[0] * imageWidth },
            //             ]
            //         };
            //     }

            //     console.log(points.red);
            //     console.log(points.blue);
            //     console.log(Math.trunc(CejLeftLength));
            //     // Draw red lines
            //     drawLines(points.red, "red", Math.trunc(CejLeftLength));
            //     // Draw blue lines
            //     drawLines(points.blue, "blue", Math.trunc(CejRightLength));

            // }
            // bonelossPoints = document.querySelectorAll('.boneloss-point');
            // console.log("continue");
            // if (imageIsNotStandardFlag) {
            //     canvas.style.display = 'none';
            //     // Hide BoneLoss Div
            //     bonelossDiv.classList.add('hidden');
            //     // Show the error
            //     imageNotStandardError.classList.remove('hidden');
            // }
            // }
            // JSONcall3(imageFile);
        }
    } catch (err) {
        clearInput();
        const noDiseaseHTML = `
            <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
        `;
        choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
    }
}
