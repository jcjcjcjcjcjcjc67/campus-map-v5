/* ================== TOOLTIP & POPUP ================== */
const shapes = document.querySelectorAll('polygon, rect');
const tooltip = document.getElementById('tooltip');
const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');

shapes.forEach(shape => {
  shape.addEventListener('mouseover', () => {
    tooltip.textContent = shape.dataset.label;
    tooltip.style.display = 'block';
  });

  shape.addEventListener('mousemove', (e) => {
    tooltip.style.top = (e.pageY - 40) + 'px';
    tooltip.style.left = (e.pageX + 10) + 'px';
  });

  shape.addEventListener('mouseout', () => {
    tooltip.style.display = 'none';
  });

  shape.addEventListener('click', () => {
    popupText.textContent = "This is " + shape.dataset.label;
    popup.style.display = 'block';
  });
});

function closePopup() {
  popup.style.display = 'none';
}

/* ================== SVG PAN & ZOOM ================== */
const svg = document.querySelector('svg');
const image = svg.querySelector('image');
let viewBox = { x: 0, y: 0, width: 3840, height: 2160 };

let isDragging = false, startX, startY;
let lastTouchDistance = 0;

function getTouchDistance(touches) {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
}

/* ================== DESKTOP PAN/ZOOM ================== */
if (!/Mobi|Android/i.test(navigator.userAgent)) {
  image.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    svg.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = ((startX - e.clientX) / svg.clientWidth) * viewBox.width;
    const dy = ((startY - e.clientY) / svg.clientHeight) * viewBox.height;
    viewBox.x += dx;
    viewBox.y += dy;
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    svg.style.cursor = 'grab';
  });

  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const scale = e.deltaY * 0.001;
    const mouseX = e.offsetX, mouseY = e.offsetY;
    const zoomX = mouseX / svg.clientWidth * viewBox.width + viewBox.x;
    const zoomY = mouseY / svg.clientHeight * viewBox.height + viewBox.y;
    viewBox.width *= 1 + scale;
    viewBox.height *= 1 + scale;
    viewBox.x = zoomX - (mouseX / svg.clientWidth) * viewBox.width;
    viewBox.y = zoomY - (mouseY / svg.clientHeight) * viewBox.height;
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
  });
}

/* ================== MOBILE PAN/ZOOM ================== */
else {
  svg.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      lastTouchDistance = getTouchDistance(e.touches);
    }
  });

  svg.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const dx = ((startX - e.touches[0].clientX) / svg.clientWidth) * viewBox.width;
      const dy = ((startY - e.touches[0].clientY) / svg.clientHeight) * viewBox.height;
      viewBox.x += dx;
      viewBox.y += dy;
      svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      const scale = (lastTouchDistance - distance) / 200;
      const touchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const touchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const zoomX = touchX / svg.clientWidth * viewBox.width + viewBox.x;
      const zoomY = touchY / svg.clientHeight * viewBox.height + viewBox.y;
      viewBox.width *= 1 + scale;
      viewBox.height *= 1 + scale;
      viewBox.x = zoomX - (touchX / svg.clientWidth) * viewBox.width;
      viewBox.y = zoomY - (touchY / svg.clientHeight) * viewBox.height;
      svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
      lastTouchDistance = distance;
    }
  }, { passive: false });

  svg.addEventListener('touchend', () => {
    isDragging = false;
  });
}

/* ================== SIDEBAR & DROPDOWNS ================== */
function toggleSidebar() {
  const sidebar = document.getElementById('right-sidebar');
  sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
}

document.getElementById('legendsBtn').addEventListener('click', () => {
  const dropdown = document.getElementById('legendsDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

window.addEventListener('click', (e) => {
  if (!e.target.matches('.dropbtn')) {
    const dropdown = document.getElementById('legendsDropdown');
    if (dropdown.style.display === 'block') dropdown.style.display = 'none';
  }
});

/* ================== HIGHLIGHT BUILDINGS ================== */
let activeArea = null;

function highlightBuildings(buildingNumbers, areaName) {
  const allShapes = document.querySelectorAll('polygon, rect');
  if (activeArea === areaName) {
    allShapes.forEach(shape => shape.classList.remove('highlighted'));
    activeArea = null;
    return;
  }
  allShapes.forEach(shape => {
    const buildingNumber = parseInt(shape.dataset.label.replace('Building ', ''));
    shape.classList.toggle('highlighted', buildingNumbers.includes(buildingNumber));
  });
  activeArea = areaName;
}

// Area 1
document.querySelector('#legendsDropdown a[href="#"]:nth-child(1)').addEventListener('click', () => {
  highlightBuildings([1,2,3,4,5,6,7,8,9,10,11,12], 'area1');
});

// Area 2
document.querySelector('#legendsDropdown a[href="#"]:nth-child(2)').addEventListener('click', () => {
  highlightBuildings([13,14,15,16,17,18,19,20,21,22,23,24,25], 'area2');
});

// Remove highlights
document.getElementById('removeHighlightsText').addEventListener('click', () => {
  document.querySelectorAll('polygon, rect').forEach(shape => shape.classList.remove('highlighted'));
  activeArea = null;
});

/* ================== SEARCH FUNCTION ================== */
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const searchValue = searchInput.value.trim();
    const allShapes = document.querySelectorAll('polygon, rect');
    allShapes.forEach(shape => shape.classList.remove('highlighted'));
    activeArea = null;
    allShapes.forEach(shape => {
      if (shape.dataset.label === searchValue) shape.classList.add('highlighted');
    });
  }
});

/* ================== CREDITS POPUP ================== */
const creditsBtn = document.getElementById('creditsBtn');
const creditsPopup = document.getElementById('creditsPopup');
const closeCreditsBtn = document.getElementById('closeCreditsBtn');

creditsBtn.addEventListener('click', () => creditsPopup.style.display = 'block');
closeCreditsBtn.addEventListener('click', () => creditsPopup.style.display = 'none');
