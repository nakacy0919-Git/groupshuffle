let memberList = [];
let currentGeneratedGroups = []; // 出力用に直近のグループデータを保存

const nameInput = document.getElementById('nameInput');
const generateBadgesBtn = document.getElementById('generateBadgesBtn');
const badgeArea = document.getElementById('badgeArea');
const memberBadgesContainer = document.getElementById('memberBadgesContainer');
const divideTypeRadios = document.getElementsByName('divideType');
const divideNumber = document.getElementById('divideNumber');
const unitLabel = document.getElementById('unitLabel');
const shuffleBtn = document.getElementById('shuffleBtn');
const resultSection = document.getElementById('resultSection');
const resultContainer = document.getElementById('resultContainer');
const projectorToggle = document.getElementById('projectorToggle');
const groupNamePreset = document.getElementById('groupNamePreset');
const assignLeader = document.getElementById('assignLeader');
const assignSubLeader = document.getElementById('assignSubLeader');
const loadingOverlay = document.getElementById('loadingOverlay');
const fullScreenBtn = document.getElementById('fullScreenBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const downloadImageBtn = document.getElementById('downloadImageBtn');

// 数値入力のプラス・マイナス
document.getElementById('btnMinus').addEventListener('click', () => {
  let val = parseInt(divideNumber.value) || 1;
  if (val > 1) divideNumber.value = val - 1;
});
document.getElementById('btnPlus').addEventListener('click', () => {
  let val = parseInt(divideNumber.value) || 1;
  divideNumber.value = val + 1;
});

// 単位ラベル切り替え
divideTypeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    unitLabel.textContent = e.target.value === 'perGroup' ? '人' : 'グループ';
  });
});

// 名簿読み込み
generateBadgesBtn.addEventListener('click', () => {
  const rawText = nameInput.value;
  const names = rawText.split('\n').map(n => n.trim()).filter(n => n !== '');
  if (names.length === 0) return alert('名前を入力してください！');
  memberList = names.map(name => ({ name: name, absent: false }));
  renderBadges();
  badgeArea.style.display = 'block';
});

function renderBadges() {
  memberBadgesContainer.innerHTML = '';
  memberList.forEach((member, index) => {
    const badge = document.createElement('div');
    badge.className = `member-badge ${member.absent ? 'absent' : ''}`;
    const icon = member.absent ? '<i class="fa-solid fa-user-slash me-1"></i>' : '<i class="fa-solid fa-user me-1"></i>';
    badge.innerHTML = `${icon}${member.name}`;
    badge.addEventListener('click', () => {
      memberList[index].absent = !memberList[index].absent;
      renderBadges();
    });
    memberBadgesContainer.appendChild(badge);
  });
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getGroupName(type, index) {
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const colors = ["赤", "白", "青", "黄", "緑", "オレンジ", "ピンク", "紫"];
  switch(type) {
    case 'group': return `グループ ${index + 1}`;
    case 'team': return `チーム ${alphabets[index % 26] || index+1}`;
    case 'number': return `${index + 1}`;
    case 'alphabet': return `${alphabets[index % 26] || index+1}`;
    case 'color': return `${colors[index % colors.length]}組`;
    case 'class': return `${index + 1}組`;
    default: return `グループ ${index + 1}`;
  }
}

// シャッフル実行
shuffleBtn.addEventListener('click', () => {
  const activeMembers = memberList.filter(m => !m.absent).map(m => m.name);
  if (activeMembers.length === 0) return alert('出席しているメンバーがいません！');
  const num = parseInt(divideNumber.value);
  if (isNaN(num) || num <= 0) return alert('正しい数値を入力してください。');

  loadingOverlay.classList.add('active');

  setTimeout(() => {
    loadingOverlay.classList.remove('active');
    
    const shuffled = shuffleArray(activeMembers);
    const divideType = document.querySelector('input[name="divideType"]:checked').value;
    let totalGroups = divideType === 'perGroup' ? Math.ceil(shuffled.length / num) : num;
    const baseSize = Math.floor(shuffled.length / totalGroups);
    const remainder = shuffled.length % totalGroups;

    let groups = [];
    let currentIndex = 0;
    for (let i = 0; i < totalGroups; i++) {
      const currentGroupSize = baseSize + (i < remainder ? 1 : 0);
      groups.push(shuffled.slice(currentIndex, currentIndex + currentGroupSize));
      currentIndex += currentGroupSize;
    }

    currentGeneratedGroups = groups; 
    renderResults(groups);
  }, 1500);
});

function renderResults(groups) {
  resultContainer.innerHTML = '';
  const presetType = groupNamePreset.value;
  
  groups.forEach((group, index) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    const groupName = getGroupName(presetType, index);
    
    const listItems = group.map((name, mIndex) => {
      let iconHtml = '';
      if (assignLeader.checked && mIndex === 0) iconHtml = '<span class="role-icon leader">👑</span>';
      else if (assignSubLeader.checked && mIndex === 1 && group.length >= 2) iconHtml = '<span class="role-icon sub-leader">🥈</span>';
      return `<div class="group-member-item border-bottom py-2 fw-medium">${iconHtml}${name}</div>`;
    }).join('');

    col.innerHTML = `
      <div class="group-result-card p-3 shadow-sm text-center">
        <h4 class="group-card-title fw-bold mb-3 border-bottom pb-2">
          ${groupName} <span class="text-muted fs-6">(${group.length}名)</span>
        </h4>
        <div>${listItems}</div>
      </div>
    `;
    resultContainer.appendChild(col);
  });

  resultSection.style.display = 'block';
  if (!document.fullscreenElement) {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// フルスクリーン・大文字表示の切り替え
projectorToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    resultContainer.classList.add('projector-mode');
    resultContainer.querySelectorAll('.col-md-6, .col-lg-4').forEach(col => { 
      col.classList.remove('col-md-6', 'col-lg-4'); col.classList.add('col-12'); 
    });
  } else {
    resultContainer.classList.remove('projector-mode');
    resultContainer.querySelectorAll('.col-12').forEach(col => { 
      col.classList.add('col-md-6', 'col-lg-4'); 
    });
  }
});

fullScreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    resultSection.requestFullscreen().catch(err => {
      alert(`フルスクリーン表示に失敗しました: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  const exportArea = document.getElementById('exportArea');
  if (document.fullscreenElement) {
    fullScreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i> 閉じる';
    fullScreenBtn.classList.replace('btn-outline-dark', 'btn-dark');
    exportArea.style.display = 'none'; 
  } else {
    fullScreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i> フルスクリーン';
    fullScreenBtn.classList.replace('btn-dark', 'btn-outline-dark');
    exportArea.style.display = 'flex'; 
  }
});

// CSV出力機能
downloadCsvBtn.addEventListener('click', () => {
  let csvContent = "グループ名,役割,氏名\n";
  const presetType = groupNamePreset.value;

  currentGeneratedGroups.forEach((group, index) => {
    const groupName = getGroupName(presetType, index);
    group.forEach((name, mIndex) => {
      let role = "";
      if (assignLeader.checked && mIndex === 0) role = "リーダー";
      else if (assignSubLeader.checked && mIndex === 1 && group.length >= 2) role = "サブリーダー";
      csvContent += `"${groupName}","${role}","${name}"\n`;
    });
  });

  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `GroupShuffle_Result_${new Date().getTime()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 画像保存機能
downloadImageBtn.addEventListener('click', () => {
  const target = document.getElementById('resultContainer');
  const originalStyle = target.style.cssText;
  
  target.style.backgroundColor = "#fdfbf7";
  target.style.padding = "20px";
  
  html2canvas(target, { scale: 2 }).then(canvas => {
    target.style.cssText = originalStyle; 
    const link = document.createElement('a');
    link.download = `GroupShuffle_Result_${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

// URLコピー機能
const copyUrlBtn = document.getElementById('copyUrlBtn');
if (copyUrlBtn) {
  copyUrlBtn.addEventListener('click', () => {
    const url = window.location.href.split('?')[0]; 
    
    navigator.clipboard.writeText(url).then(() => {
      const originalText = copyUrlBtn.innerHTML;
      copyUrlBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>コピーしました!</span>';
      copyUrlBtn.style.backgroundColor = '#d1e7dd';
      copyUrlBtn.style.borderColor = '#badbcc';
      copyUrlBtn.style.color = '#0f5132';
      
      setTimeout(() => {
        copyUrlBtn.innerHTML = originalText;
        copyUrlBtn.style.backgroundColor = '';
        copyUrlBtn.style.borderColor = '';
        copyUrlBtn.style.color = '';
      }, 2000);
    }).catch(err => {
      alert('URLのコピーに失敗しました。');
    });
  });
}