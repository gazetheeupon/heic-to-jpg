(function () {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const runBtn = document.getElementById('runBtn');
  const formatSel = document.getElementById('format');
  const qualityInput = document.getElementById('quality');
  const qualityVal = document.getElementById('qualityVal');
  const status = document.getElementById('status');
  const resultCard = document.getElementById('resultCard');
  const grid = document.getElementById('grid');
  const downloadAllBtn = document.getElementById('downloadAllBtn');

  let files = [];
  let converted = [];

  qualityInput.addEventListener('input', () => {
    qualityVal.textContent = qualityInput.value;
  });

  function setFiles(list) {
    const arr = Array.from(list).filter((f) =>
      /\.(heic|heif)$/i.test(f.name) || f.type === 'image/heic' || f.type === 'image/heif'
    );
    if (!arr.length) {
      status.textContent = 'No HEIC/HEIF files found in your selection.';
      return;
    }
    files = arr;
    runBtn.disabled = false;
    status.textContent = files.length + ' file(s) ready. Click Convert.';
  }

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => setFiles(e.target.files));
  ['dragenter', 'dragover'].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add('drag');
    })
  );
  ['dragleave', 'drop'].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag');
    })
  );
  dropzone.addEventListener('drop', (e) => setFiles(e.dataTransfer.files));

  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true;
    grid.innerHTML = '';
    converted = [];
    resultCard.style.display = 'none';
    const format = formatSel.value;
    const quality = parseFloat(qualityInput.value);
    const ext = format === 'image/png' ? 'png' : 'jpg';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      status.textContent = 'Converting ' + (i + 1) + ' / ' + files.length + ': ' + file.name;
      try {
        const resultBlob = await heic2any({ blob: file, toType: format, quality });
        const blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
        const url = URL.createObjectURL(blob);
        const outName = file.name.replace(/\.(heic|heif)$/i, '') + '.' + ext;
        converted.push({ name: outName, url });

        const div = document.createElement('div');
        div.className = 'thumb';
        div.innerHTML =
          '<img src="' + url + '" alt="' + outName + '">' +
          '<div class="name">' + outName + '</div>' +
          '<a download="' + outName + '" href="' + url + '">Download</a>';
        grid.appendChild(div);
      } catch (err) {
        const div = document.createElement('div');
        div.className = 'thumb';
        div.innerHTML = '<div class="name">' + file.name + ': failed (' + err.message + ')</div>';
        grid.appendChild(div);
      }
    }
    resultCard.style.display = 'block';
    status.textContent = 'Done. ' + converted.length + ' / ' + files.length + ' converted.';
    runBtn.disabled = false;
  });

  downloadAllBtn.addEventListener('click', () => {
    converted.forEach((c, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = c.url;
        a.download = c.name;
        a.click();
      }, i * 200);
    });
  });
})();
