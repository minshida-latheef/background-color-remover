const upload = document.getElementById('upload');
const colorPicker = document.getElementById('colorPicker');
const toleranceInput = document.getElementById('tolerance');
const removeBtn = document.getElementById('removeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let originalImage = null;

// 1. Load image onto the canvas
upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      originalImage = img;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// 2. Convert hex color (#ffffff) to RGB object
function hexToRgb(hex) {
  const num = parseInt(hex.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// 3. Loop through pixels and set matching ones to transparent
removeBtn.addEventListener('click', () => {
  if (!originalImage) return;

  // Redraw original image first so tolerance adjustments work cleanly
  ctx.drawImage(originalImage, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const target = hexToRgb(colorPicker.value);
  const tolerance = parseInt(toleranceInput.value, 10);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const distance = Math.sqrt(
      Math.pow(r - target.r, 2) +
      Math.pow(g - target.g, 2) +
      Math.pow(b - target.b, 2)
    );

    if (distance <= tolerance) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
});

// 4. Download the transparent PNG
downloadBtn.addEventListener('click', () => {
  if (!originalImage) return;
  const link = document.createElement('a');
  link.download = 'transparent-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
