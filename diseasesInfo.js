'use strict';

const modelTitle = document.querySelector('.model-title');
const uploadedImageContainer = document.querySelector('.uploaded-image');
const choosingModels = document.querySelector('.choosing-models');
// const models = document.querySelectorAll('.model');
// const selectedImage = document.querySelector('.selected-image');
const diseasesList = document.querySelector('.list-diseases');
const allDiseasesInput = document.getElementById('all');
const diseasesMenuList = document.querySelector('.body');
const places = document.querySelectorAll('.place');
const checkboxInput = document.querySelectorAll('input[type="checkbox"]');
const currentImage = document.querySelector('.current-img');
const uploadInput = document.getElementById('upload-input');
let imageWidth;
let imageHeight;
// choosingModels.addEventListener('click', models);
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
    // <div score="${score}%" disease-name="${diseaseName}" class="place ${color}" style="top: ${topCoords}px; right: ${leftCoords}px; width: ${width}px; height: ${height}px; display: block;" data-value="${diseaseName}"></div>
    // `;
    choosingModels.insertAdjacentHTML('beforeend', html);
}

// const modifyImage = async function (originalFile, originalName) {
//     const originalContent = await originalFile.arrayBuffer();
//     // Create a new Blob with the modified content
//     const modifiedBlob = new Blob([originalContent], { type: `image/png` });

//     // Create a download link for the modified Blob
//     const downloadLink = document.createElement('a');
//     downloadLink.href = URL.createObjectURL(modifiedBlob);
//     downloadLink.download = `modified_image.png`;

//     // Create a new File object with the modified Blob and name
//     const modifiedFile = new File([modifiedBlob], 'modified_image.png', { lastModified: originalFile.lastModified, type: `image/png` });

//     // Trigger the download
//     // downloadLink.click();

//     return modifiedFile;
// }

async function changeInput(e) {
    clearInput();
    e.preventDefault();

    // Reset checked input to fasle
    checkboxInput.forEach(input => {
        input.checked = false;
        input.removeAttribute('disabled');
        input.closest('div').style.opacity = 1;
    });
    diseasesList.classList.add('hidden');
    currentImage.classList.remove('hidden');

    // Getting the file information
    const imageFile = e.target.files[0];
    // const imageName = imageFile.name;
    // console.log(imageFile.width);
    // console.log(e);

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

    // const newImg = document.createElement('img');
    // newImg.src = URL.createObjectURL(imageFile);
    // console.log(newImg.width);
    // console.log(URL.createObjectURL(imageFile).width);

    // const file = await modifyImage(imageFile, imageName);

    currentImage.setAttribute('src', URL.createObjectURL(imageFile));
    JSONcall1(imageFile);
}

async function JSONcall1(imageFile) {
    const formData = new FormData();
    console.log(imageFile);
    formData.append("image", imageFile);

    try {
        const res = await Promise.race([fetch('https://dentalvision.ju.edu.jo/upload/', {
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
            console.log(data);
            JSONcall2(imageFile);
        }
    } catch (err) {
        clearInput();
        const noDiseaseHTML = `
            <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
        `;
        choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
    }
}

async function JSONcall2(imageFile) {
    try {
        const res = await Promise.race([fetch('https://dentalvision.ju.edu.jo/v8_mohammad/', {
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
            const numberOfDiseases = data.length;

            if (!numberOfDiseases) {
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
            } else {
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

                const selectedImage = document.querySelector('.selected-image');

                console.log(selectedImage);
                selectedImage.addEventListener('load', function (e) {
                    console.log(e);
                    console.log(selectedImage.width);
                    imageWidth = +selectedImage.getClientRects()[0].width;
                    imageHeight = +selectedImage.getClientRects()[0].height;
                    console.log(typeof (imageWidth), imageHeight);


                    // console.log(selectedImage.src);
                    for (const eachBox of data) {
                        const { box } = eachBox;
                        console.log(box);
                        console.log(eachBox);
                        const type = eachBox.cls;
                        const { score } = eachBox;
                        console.log(checkboxInput[type]);
                        const diseaseColorInput = checkboxInput[type].dataset.color;
                        console.log(diseaseColorInput);
                        const nameOfDisease = checkboxInput[type].dataset.diseaseName;
                        checkboxInput[type].checkVisibility = true;
                        checkboxInput[type].checked = true;

                        // why is it undefined?
                        console.log(imageHeight, imageWidth);
                        generateDiseasePlace(diseaseColorInput, nameOfDisease, Number(box[0] * imageHeight), box[1] * imageWidth, (score * 100).toFixed(1), (box[3] - box[1]) * imageWidth, (box[2] - box[0]) * imageHeight);
                        // generateDiseasePlace(diseaseColorInput, nameOfDisease, box[0] * 100, box[1] * 100, (score * 100).toFixed(1), (box[3] - box[1]) * 100, (box[2] - box[0]) * 100);
                        console.log(box[0]);
                        console.log(box[1]);
                        console.log(box[2]);
                        console.log(box[3]);
                        // color = '', diseaseName, topCoords, leftCoords, score, width, height
                    }
                    // Get all places that were created
                    const diseasesPlaces = document.querySelectorAll('.place');

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
                        // const placeEl = places.find(el => el.attributes[4].value === targetValue);

                        places.filter(el => el.attributes[4].value === targetValue).map(el => {
                            if (targetEl.checked) {
                                el.style.display = 'block';
                            } else {
                                el.style.display = 'none';
                            }
                        });
                        // if (targetEl.checked) {
                        //     placeEl.style.display = 'block';
                        // } else {
                        //     placeEl.style.display = 'none';
                        // }
                    }
                    diseasesList.addEventListener('click', selectBox);
                    diseasesList.classList.remove('hidden');
                    currentImage.classList.add('hidden');
                })
            }
        }
    } catch (err) {
        clearInput();
        const noDiseaseHTML = `
            <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
        `;
        choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
    }
}
