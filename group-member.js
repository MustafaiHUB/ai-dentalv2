const cardsContainer = document.querySelector('.group-members-cards')
const extraText = document.querySelectorAll('.extra-text')
const seeMoreButton = document.querySelectorAll('.see_more')
cardsContainer.addEventListener('click', function (e) {
    const moreTextBtn = e.target;
    if (moreTextBtn.classList.contains('see_more')) {
        const extraTextTarget = moreTextBtn.closest('.card-text').querySelector('.extra-text');
        if (moreTextBtn.textContent === 'See More') {
            extraTextTarget.style.display = 'block'
            moreTextBtn.textContent = 'See Less';
        } else {
            extraTextTarget.style.display = 'none'
            moreTextBtn.textContent = 'See More';
        }
    }
})