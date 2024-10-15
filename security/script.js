const gallery = document.getElementById('securityGallery')
const moveToTopButton = document.getElementById('moveToTop')

const firstButton = document.getElementById('first')
const lastButton = document.getElementById('last')
const nextButton = document.getElementById('next')
const pageCounter = document.getElementById('pageCounter')
const previousButton = document.getElementById('previous')

const header = document.getElementById('header')
const pagination = document.getElementById('pagination')
const refresh = document.getElementById('refresh')

const pageSize = 24

let currentPage = 1
let styleSheet
let totalImages = 0

const galleryStlyeSheet = (amount) => {
    const lastRowAmount =
        document.getElementById('securityGallery').childElementCount % amount ||
        amount

    let lastRowStyle = ''

    for (let i = 0; i < lastRowAmount; i++) {
        lastRowStyle += `
            .gallery:nth-last-child(${i}):hover {
                transform: scale(var(--scale)) translateY(calc(-1 * var(--translateY)));
            }
        `
    }

    if (lastRowAmount === amount) {
        lastRowStyle += `
        .gallery:nth-child(${amount}n):nth-last-child(-n+${amount}):hover {
            transform: scale(var(--scale)) translateX(calc(-1 * var(--translateX))) translateY(calc(-1 * var(--translateY)));
        }`
    }

    return `
        @media only screen and (min-width: 768px) {
            :root {
                --scale: 1.25;
                --translateX: 32px;
                --translateY: 16px;
            }
        }
        @media only screen and (max-width: 768px) {
            :root {
                --scale: 1.05;
                --translateX: 0px;
                --translateY: 0px;
            }
        }
        @media only screen and (max-width: 384px) {
            :root {
                --scale: 1.00;
                --translateX: 0px;
                --translateY: 0px;
            }
        }

        .gallery:hover {
            transform: scale(var(--scale));
        }

        .gallery:nth-child(${amount}n+1):hover {
            transform: scale(var(--scale)) translateX(var(--translateX));
        }
        .gallery:nth-child(${amount}n):hover {
            transform: scale(var(--scale)) translateX(calc(-1 * var(--translateX)));
        }
        .gallery:nth-child(-n+${amount}):hover {
            transform: scale(var(--scale)) translateY(var(--translateY));
        }

        ${lastRowStyle}

        .gallery:nth-child(${amount}n+1):nth-child(-n+${amount}):hover {
            transform: scale(var(--scale)) translateX(var(--translateX)) translateY(var(--translateY));
        }
        .gallery:nth-child(${amount}n):nth-child(-n+${amount}):hover {
            transform: scale(var(--scale)) translateX(calc(-1 * var(--translateX))) translateY(var(--translateY));
        }
        .gallery:nth-child(${amount}n+1):nth-last-child(-n+${amount}):hover {
            transform: scale(var(--scale)) translateX(var(--translateX)) translateY(calc(-1 * var(--translateY)));
        }
    `
}

const calculateGridRowItems = () => {
    styleSheet && styleSheet.remove()
    const screenWidth = document.documentElement.clientWidth
    const BODY_MARGIN = 32
    const GRID_GAP = 32
    const ITEM_WIDTH = 256
    const availableSpace = screenWidth - 2 * BODY_MARGIN
    const amount =
        Math.floor((availableSpace + GRID_GAP) / (ITEM_WIDTH + GRID_GAP)) || 1

    styleSheet = document.createElement('style')
    styleSheet.innerHTML = galleryStlyeSheet(amount)
    document.head.appendChild(styleSheet)
}

const modalEventListener = (img, imgID) => {
    const modalBackground = document.createElement('div')
    modalBackground.id = 'modalBackground'
    modalBackground.style.top = `${window.scrollY}px`

    const modal = document.createElement('div')
    modal.id = 'modal'

    const modalButton = document.createElement('button')
    modalButton.id = 'modalButton'
    modalButton.innerHTML = `&#10006;`

    const modalImage = document.createElement('img')
    modalImage.id = 'modalImage'
    modalImage.src = img.src
    modalImage.alt = img.alt

    modal.style.width = `${modalImage.width + 64}px`

    const modalText = document.createElement('div')
    modalText.id = 'modalText'
    modalText.innerHTML = img.alt

    const modalCopyright = document.createElement('div')
    modalCopyright.id = 'modalCopyright'
    modalCopyright.innerHTML = 'Copyright &#169; 2024 Michael'

    modal.appendChild(modalButton)
    modal.appendChild(modalImage)
    modal.appendChild(modalText)
    modal.appendChild(modalCopyright)

    const trapFocus = (event) => {
        if (event.key === 'Tab') {
            event.preventDefault()
            modalButton.focus()
        }
    }

    modalBackground.addEventListener('click', (event) => {
        if (event.target === modalBackground || event.target === modalButton) {
            modalBackground.remove()
            gallery.style.marginRight = '32px'
            document.body.style.overflowY = 'auto'
            document.removeEventListener('keydown', trapFocus)
            document.getElementById(imgID)?.focus()
        }
    })

    modalBackground.appendChild(modal)

    gallery.style.marginRight = `${
        32 + window.innerWidth - document.documentElement.clientWidth
    }px`
    document.body.style.overflowY = 'hidden'
    document.body.appendChild(modalBackground)

    modalButton.focus()

    document.addEventListener('keydown', trapFocus)
}

const updatePaginationControls = (page) => {
    if (page <= 1) {
        firstButton.setAttribute('disabled', 'true')
        previousButton.setAttribute('disabled', 'true')
    } else {
        firstButton.removeAttribute('disabled')
        previousButton.removeAttribute('disabled')
    }

    if (Math.ceil(totalImages / pageSize) <= page) {
        lastButton.setAttribute('disabled', 'true')
        nextButton.setAttribute('disabled', 'true')
    } else {
        lastButton.removeAttribute('disabled')
        nextButton.removeAttribute('disabled')
    }

    pageCounter.innerHTML = page
}

const setLoading = (loading) => {
    if (loading) {
        document.getElementById('errorButton')?.setAttribute('disabled', 'true')
        firstButton.setAttribute('disabled', 'true')
        lastButton.setAttribute('disabled', 'true')
        nextButton.setAttribute('disabled', 'true')
        previousButton.setAttribute('disabled', 'true')
        refresh.setAttribute('disabled', 'true')
    } else {
        document.getElementById('errorButton')?.removeAttribute('disabled')
        firstButton.removeAttribute('disabled')
        lastButton.removeAttribute('disabled')
        nextButton.removeAttribute('disabled')
        previousButton.removeAttribute('disabled')
        refresh.removeAttribute('disabled')
    }
}

const createError = (e) => {
    document.getElementById('error')?.remove()
    const error = document.createElement('div')
    error.id = 'error'
    const errorImage = document.createElement('img')
    errorImage.alt = 'Unable to load past security recordings.'
    errorImage.src = './error.jpeg'
    error.style.width = 'min(100%, 480px)'
    const errorInfo = document.createElement('div')
    errorInfo.id = 'errorInfo'
    errorInfo.innerHTML = e
    const errorButton = document.createElement('button')
    errorButton.id = 'errorButton'
    errorButton.innerHTML = 'Retry'

    error.appendChild(errorImage)
    error.appendChild(errorInfo)
    error.appendChild(errorButton)

    document.body.appendChild(error)

    errorButton.addEventListener('click', () => fetchImages(1))
}

const displayError = () => {
    gallery.style.display = 'none'
    header.style.margin = 'min(10vw, 32px) min(5vw, 16px) 0px'
    header.style.textAlign = 'center'
    pagination.style.display = 'none'
    refresh.style.display = 'none'
}

const hideError = () => {
    document.getElementById('error')?.remove()
    gallery.style.display = 'grid'
    header.style.margin = 'min(10vw, 32px) min(10vw, 32px) 0px min(10vw, 32px)'
    header.style.textAlign = 'left'
    pagination.style.display = totalImages <= pageSize ? 'none' : 'flex'
    refresh.style.display = 'block'
}

const handleError = (error) => {
    createError(error)
    displayError()
    setLoading(false)
    console.log('Error fetching the recorded images:', error)
}

const showUI = (page) => {
    setLoading(false)
    updatePaginationControls(page)
    hideError()
}

const fetchImages = async (page, automatic = false) => {
    try {
        setLoading(true)

        const response = await fetch(`/images?page=${page}&page_size=${pageSize}`)
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(
                'Received unexpected content type. Unable to retrieve past security recordings.'
            )
        }
        const {images, total_images, _page_size} = await response.json()

        if (!images)
            throw new Error('Unable to retrieve past security recordings.')

        totalImages = images.length

        gallery.innerHTML = ''
        currentPage = page
        totalImages = total_images

        const buttonElements = []

        images.forEach((image) => {
            const button = document.createElement('button')
            button.classList.add('gallery')

            const img = document.createElement('img')
            img.src = `./security_images/${image}`
            img.alt = image.replace(/(^security_image_|.jpg$)/g, '')
            img.style.width = '100%'
            img.style.verticalAlign = 'middle'
            img.loading = 'lazy'
            img.title = img.alt

            buttonElements.push(button)
            button.id = `galleryButton-${buttonElements.length}-${page}`

            button.addEventListener('mouseenter', () => {
                buttonElements.forEach((b) => {
                    b !== button
                        ? b.classList.add('filtered')
                        : b.classList.add('hovered')
                })
            })

            button.addEventListener('mouseleave', () => {
                buttonElements.forEach((b) => {
                    b.classList.remove('filtered', 'hovered')
                })
            })

            button.addEventListener('focusout', () => {
                buttonElements.forEach((b) => {
                    b.classList.remove('filtered', 'hovered')
                })
            })

            button.addEventListener('click', () =>
                modalEventListener(img, button.id)
            )

            button.appendChild(img)
            gallery.appendChild(button)
        })

        if (!buttonElements.length)
            throw new Error('There are no past security recordings.')

        calculateGridRowItems()

        if (!automatic)
            document.getElementById(`galleryButton-1-${page}`).focus()

        showUI(page)
    } catch (error) {
        handleError(error)
    }
}

const moveToTop = () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
    })

    window.addEventListener(
        'scroll',
        (onScroll = () => {
            if (window.scrollY === 0) {
                document
                    .getElementById(`galleryButton-1-${currentPage}`)
                    .focus()
                window.removeEventListener('scroll', onScroll)
            }
        })
    )
}

const automaticPageRefresh = () => {
    setTimeout(() => {
        fetchImages(currentPage, true)
        automaticPageRefresh()
    }, 300000)
}

const displayMoveButton = () => {
    if (window.scrollY <= 0) moveToTopButton.style.display = 'none'
    else moveToTopButton.style.display = 'block'
}

window.onload = async () => {
    await fetchImages(1)

    automaticPageRefresh()

    moveToTopButton.addEventListener('click', moveToTop)
    firstButton.addEventListener('click', () => {
        fetchImages(1)
        moveToTop()
    })
    lastButton.addEventListener('click', () => {
        fetchImages(Math.ceil(totalImages / pageSize))
        moveToTop()
    })
    nextButton.addEventListener('click', () => {
        fetchImages(currentPage + 1)
        moveToTop()
    })
    previousButton.addEventListener('click', () => {
        fetchImages(currentPage - 1)
        moveToTop()
    })
    refresh.addEventListener('click', () => {
        fetchImages(currentPage)
        moveToTop()
    })

    window.addEventListener('resize', calculateGridRowItems)
    window.addEventListener('scroll', displayMoveButton)

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return

        const focussableElements = Array.from(
            document.querySelectorAll('button')
        )
            .filter((item) => !item.disabled)
            .filter((item) => item.style.display !== 'none')

        const focussedIndex = focussableElements.indexOf(document.activeElement)
        if (focussedIndex === -1) return

        event.preventDefault()

        if (event.shiftKey) {
            if (focussedIndex === 0) {
                focussableElements.at(-1).focus()
            } else {
                focussableElements[focussedIndex - 1].focus()
            }
        } else {
            if (focussedIndex === focussableElements.length - 1) {
                focussableElements[0].focus()
            } else {
                focussableElements[focussedIndex + 1].focus()
            }
        }
    })
}
