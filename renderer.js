// ==========================================
// Renderer Process: UI Control and Actions
// ==========================================

// 状態管理
let srcPath = '';
let destPath = '';
let srcFiles = [];
let destFiles = [];
let currentTab = 'src'; // 'src' | 'dest'
let isCopying = false;

// UI要素の取得
const srcDropZone = document.getElementById('src-drop-zone');
const destDropZone = document.getElementById('dest-drop-zone');
const srcPathDisplay = document.getElementById('src-path-display');
const destPathDisplay = document.getElementById('dest-path-display');
const btnStartCopy = document.getElementById('btn-start-copy');
const btnCancelCopy = document.getElementById('btn-cancel-copy');

const progressContainer = document.getElementById('progress-container');
const progressStatus = document.getElementById('progress-status');
const progressPercent = document.getElementById('progress-percent');
const progressBar = document.getElementById('progress-bar');
const progressFile = document.getElementById('progress-file');

const tabSrc = document.getElementById('tab-src');
const tabDest = document.getElementById('tab-dest');
const countSrc = document.getElementById('count-src');
const countDest = document.getElementById('count-dest');
const scanInfo = document.getElementById('scan-info');
const galleryGrid = document.getElementById('gallery-grid');

// モーダル要素
const previewModal = document.getElementById('preview-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');
const modalMetaTitle = document.getElementById('modal-meta-title');
const modalMetaDate = document.getElementById('modal-meta-date');
const modalMetaSize = document.getElementById('modal-meta-size');

// アイコンの初期化 (Lucide)
lucide.createIcons();

// ==========================================
// イベントリスナーの登録
// ==========================================

// 1. コピー元・コピー先の選択イベント
srcDropZone.addEventListener('click', () => handleSelectDirectory('src'));
destDropZone.addEventListener('click', () => handleSelectDirectory('dest'));

setupDragAndDrop(srcDropZone, 'src');
setupDragAndDrop(destDropZone, 'dest');

// 2. コピー実行 / キャンセル
btnStartCopy.addEventListener('click', handleStartCopy);
btnCancelCopy.addEventListener('click', () => window.api.cancelCopy());

// 3. タブ切り替え
tabSrc.addEventListener('click', () => switchTab('src'));
tabDest.addEventListener('click', () => switchTab('dest'));

// 4. モーダル
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// キーボードイベント (Escキーでモーダルを閉じる)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ==========================================
// ハンドラ関数定義
// ==========================================

// ディレクトリ選択の処理
async function handleSelectDirectory(type) {
  if (isCopying) return;
  
  const currentPath = type === 'src' ? srcPath : destPath;
  const selectedPath = await window.api.selectDirectory(currentPath);
  
  if (selectedPath) {
    updateDirectory(type, selectedPath);
  }
}

// ドラッグ＆ドロップの設定
function setupDragAndDrop(element, type) {
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (isCopying) return;
    element.classList.add('dragover');
  });

  element.addEventListener('dragleave', () => {
    element.classList.remove('dragover');
  });

  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('dragover');
    if (isCopying) return;

    if (e.dataTransfer.files.length > 0) {
      // フォルダであるかを検証するため、メタデータやメインプロセス経由で行うが、
      // Electronではファイルのパスが直接取得できる
      const file = e.dataTransfer.files[0];
      // Nodeのfsモジュールはレンダラー側では直接使えないので、パスを渡して処理
      updateDirectory(type, file.path);
    }
  });
}

// ディレクトリ情報の更新とスキャン
async function updateDirectory(type, pathStr) {
  if (type === 'src') {
    srcPath = pathStr;
    srcPathDisplay.textContent = srcPath;
    srcPathDisplay.title = srcPath;
    scanInfo.textContent = 'コピー元をスキャン中...';
    try {
      srcFiles = await window.api.scanDirectory(srcPath);
      countSrc.textContent = srcFiles.length;
    } catch (e) {
      showErrorToast(`コピー元のスキャンに失敗しました: ${e.message}`);
      srcFiles = [];
      countSrc.textContent = '0';
    }
  } else {
    destPath = pathStr;
    destPathDisplay.textContent = destPath;
    destPathDisplay.title = destPath;
    scanInfo.textContent = 'コピー先をスキャン中...';
    try {
      destFiles = await window.api.scanDirectory(destPath);
      countDest.textContent = destFiles.length;
    } catch (e) {
      showErrorToast(`コピー先のスキャンに失敗しました: ${e.message}`);
      destFiles = [];
      countDest.textContent = '0';
    }
  }

  scanInfo.textContent = `スキャン完了 - 元: ${srcFiles.length} 件 / 先: ${destFiles.length} 件`;
  
  // 表示の更新
  renderGallery();
  updateButtonStates();
}

// アクションボタンの状態制御
function updateButtonStates() {
  const hasSrcFiles = srcFiles.length > 0;
  const hasDestPath = destPath !== '';
  
  btnStartCopy.disabled = !hasSrcFiles || !hasDestPath || isCopying;
  btnCancelCopy.disabled = !isCopying;
}

// タブの切り替え
function switchTab(tab) {
  if (currentTab === tab) return;
  
  currentTab = tab;
  tabSrc.classList.toggle('active', tab === 'src');
  tabDest.classList.toggle('active', tab === 'dest');
  
  renderGallery();
}

// ==========================================
// ギャラリー描画
// ==========================================

function renderGallery() {
  galleryGrid.innerHTML = '';
  const files = currentTab === 'src' ? srcFiles : destFiles;

  if (files.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <i data-lucide="image-off"></i>
      <p>${currentTab === 'src' 
        ? '表示するファイルがありません。コピー元フォルダを選択してスキャンしてください。' 
        : 'コピー先フォルダに動画や画像がありません。'}</p>
    `;
    galleryGrid.appendChild(emptyState);
    lucide.createIcons();
    return;
  }

  files.forEach((file) => {
    const card = document.createElement('div');
    card.className = 'file-card';
    
    // file プロトコルを使用してローカルファイルへのパスを指定
    const fileUrl = `file://${file.path}`;
    
    let mediaHtml = '';
    let badgeClass = file.type === 'video' ? 'video' : 'image';
    let iconName = file.type === 'video' ? 'video' : 'image';

    if (file.type === 'video') {
      // 動画のサムネイル代わりにvideo要素を配置し、最初のフレームを表示
      mediaHtml = `
        <video class="thumb-image" src="${fileUrl}#t=0.1" preload="metadata" muted></video>
      `;
    } else {
      mediaHtml = `
        <img class="thumb-image" src="${fileUrl}" loading="lazy" alt="${file.name}">
      `;
    }

    card.innerHTML = `
      <div class="thumb-area">
        ${mediaHtml}
        <div class="media-badge ${badgeClass}">
          <i data-lucide="${iconName}"></i>
        </div>
      </div>
      <div class="card-info">
        <div class="file-name" title="${file.name}">${file.name}</div>
        <div class="file-meta-row">
          <span class="date-badge">${file.creationDate}</span>
          <span>${formatBytes(file.size)}</span>
        </div>
      </div>
    `;

    // クリックイベントでプレビュー表示
    card.addEventListener('click', () => openPreview(file));
    galleryGrid.appendChild(card);
  });

  lucide.createIcons();
}

// プレビューモーダルを開く
function openPreview(file) {
  modalBody.innerHTML = '';
  const fileUrl = `file://${file.path}`;
  
  if (file.type === 'video') {
    const video = document.createElement('video');
    video.src = fileUrl;
    video.controls = true;
    video.autoplay = true;
    modalBody.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = fileUrl;
    modalBody.appendChild(img);
  }
  
  modalMetaTitle.textContent = file.name;
  modalMetaDate.innerHTML = `<i data-lucide="calendar"></i> 撮影・作成日: ${file.creationDate} (${file.dateSource === 'metadata' ? 'メタデータ' : 'ファイルシステム'})`;
  modalMetaSize.innerHTML = `<i data-lucide="database"></i> サイズ: ${formatBytes(file.size)}`;
  
  previewModal.classList.add('show');
  lucide.createIcons();
}

// プレビューモーダルを閉じる
function closeModal() {
  previewModal.classList.remove('show');
  // 動画が再生中なら停止して破棄
  modalBody.innerHTML = '';
}

// ==========================================
// コピー処理の実装
// ==========================================

async function handleStartCopy() {
  if (isCopying || srcFiles.length === 0 || !destPath) return;

  isCopying = true;
  updateButtonStates();
  
  // UIのプログレスバーをアクティブに
  progressContainer.classList.add('active');
  progressStatus.textContent = 'コピー中...';
  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';
  progressFile.textContent = '';

  // コピー処理の開始
  try {
    const result = await window.api.startCopy(srcFiles, destPath);
    
    if (result.status === 'completed') {
      progressStatus.textContent = 'コピー完了！';
      progressPercent.textContent = '100%';
      progressBar.style.width = '100%';
      progressFile.textContent = `全 ${result.copiedCount} 件のコピーに成功しました。`;
    } else if (result.status === 'cancelled') {
      progressStatus.textContent = 'キャンセルされました';
      progressFile.textContent = `${result.copiedCount} 件コピー後に中断しました。`;
    }
  } catch (err) {
    progressStatus.textContent = 'エラーが発生しました';
    progressFile.textContent = err.message;
    showErrorToast(`コピーエラー: ${err.message}`);
  } finally {
    isCopying = false;
    updateButtonStates();
    // コピー完了後にコピー先をリフレッシュ
    await updateDirectory('dest', destPath);
  }
}

// コピーの進捗アップデートの受信
window.api.onCopyProgress((data) => {
  if (data.status === 'copying') {
    const percent = Math.round((data.copiedCount / data.totalFiles) * 100);
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    progressStatus.textContent = `コピー中 (${data.copiedCount}/${data.totalFiles})`;
    progressFile.textContent = `コピー中: ${data.currentFile}`;
  }
});

// コピー中の個別ファイルのエラー受信
window.api.onCopyError((data) => {
  showErrorToast(`ファイルコピー失敗: ${data.fileName}\n${data.error}`);
});

// ==========================================
// ユーティリティ関数
// ==========================================

// バイトサイズを適切な単位（KB/MB/GB）に変換
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 簡易エラー表示 (アラートダイアログ等で代用)
function showErrorToast(message) {
  console.error(message);
  alert(message);
}
