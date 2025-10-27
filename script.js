// --- 1. 데이터 정의 ---

let categories = [
  { name: "업무", color: "#DFF2D8" },
  { name: "개인", color: "#F4BBD3" },
  { name: "학습", color: "#F686BD" }
];

let todoList = [
  { id: 1, title: "JavaScript 복습", done: false, category: "학습", color: categories.find(c => c.name === "학습")?.color || "#999", dueDate: "2025-11-10" },
  { id: 2, title: "점심 약속 잡기", done: false, category: "개인", color: categories.find(c => c.name === "개인")?.color || "#999", dueDate: "2025-10-27" },
  { id: 3, title: "프로젝트 기획서 작성", done: true, category: "업무", color: categories.find(c => c.name === "업무")?.color || "#999", dueDate: "2025-10-25" },
];


let lastNo = todoList.length > 0 ? Math.max(...todoList.map(item => item.id)) : 0;

// --- 2. DOM 요소 생성 및 헬퍼 함수 ---

/**
 * Todo 아이템 객체를 전달받아 화면에 표현하는 li 요소를 생성하는 함수
 */
function getTodoItemElem(item) {
  const liElem = document.createElement('li');
  liElem.id = `todo-${item.id}`;
  liElem.dataset.id = item.id;
  liElem.classList.add('todo-item');
  if (item.done) {
    liElem.classList.add('done');
  }
  // 카테고리 색상으로 왼쪽 border 설정
  item.color = categories.find(c => c.name === item.category)?.color || "#999"; // 카테고리가 삭제되었을 경우를 대비해 색상 재확인
  liElem.style.borderLeftColor = item.color;

  // 제목, 카테고리, 마감일 컨테이너
  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('item-details');

  // 1. 카테고리 태그
  const categoryTag = document.createElement('span');
  categoryTag.classList.add('category-tag');
  categoryTag.textContent = item.category;
  categoryTag.style.backgroundColor = item.color;
  detailsDiv.appendChild(categoryTag);

  // 2. 제목 (클릭 시 완료/미완료 토글)
  const titleElem = document.createElement('span');
  titleElem.classList.add('todo-title');
  titleElem.textContent = item.title;
  titleElem.addEventListener('click', () => toggleDone(item.id));
  detailsDiv.appendChild(titleElem);

  // 3. 마감일
  const dueDateElem = document.createElement('span');
  dueDateElem.classList.add('due-date');

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = item.dueDate && !item.done && item.dueDate < today;

  if (item.dueDate) {
    dueDateElem.textContent = `마감: ${item.dueDate}`;
  } else {
    dueDateElem.textContent = '마감일 없음';
  }

  if (isOverdue) {
    dueDateElem.style.color = '#d9534f';
    dueDateElem.style.fontWeight = 'bold';
  }

  detailsDiv.appendChild(dueDateElem);

  // 4. 삭제 버튼
  const deleteElem = document.createElement('button');
  deleteElem.type = 'button';
  deleteElem.textContent = '삭제';
  deleteElem.classList.add('delete-button');
  deleteElem.addEventListener('click', (e) => {
    e.stopPropagation();
    removeItem(item.id);
  });

  liElem.appendChild(detailsDiv);
  liElem.appendChild(deleteElem);

  return liElem;
}

// --- 3. 카테고리 관리 로직 ---

/**
 * 모달 열기
 */
function openCategoryModal() {
  document.getElementById('category-modal-overlay').style.display = 'flex';
  setTimeout(() => {
    document.getElementById('category-modal-overlay').classList.add('active');
  }, 10);
  document.getElementById('new-category-name').focus();
  console.log("Category Modal Opened."); // <-- 로그 추가
}

/**
 * 모달 닫기
 */
function closeCategoryModal(event) {
  // 모달 오버레이를 클릭한 경우에만 닫히도록 이벤트 버블링을 방지
  if (event && event.target.id !== 'category-modal-overlay') return;

  const overlay = document.getElementById('category-modal-overlay');
  overlay.classList.remove('active');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300); // CSS transition 시간과 맞춰 딜레이 적용
  console.log("Category Modal Closed."); // <-- 로그 추가
}

/**
 * 새로운 카테고리를 추가합니다.
 */
function addCategory() {
  const nameInput = document.getElementById('new-category-name');
  const colorInput = document.getElementById('new-category-color');
  const name = nameInput.value.trim();
  const color = colorInput.value;

  if (name === '') {
    showNotification('카테고리 이름을 입력해주세요.', '#d9534f');
    return;
  }

  if (categories.some(c => c.name === name)) {
    showNotification('이미 존재하는 카테고리 이름입니다.', '#f0ad4e');
    return;
  }

  categories.push({ name, color });

  // UI 업데이트
  populateCategoryList();
  populateCategories();

  // 입력 필드 초기화
  nameInput.value = '';
  colorInput.value = '#FE5D9F';
  nameInput.focus();

  showNotification(`'${name}' 카테고리가 추가되었습니다.`, '#5cb85c');
  console.log(`[Category Added] Name: ${name}, Color: ${color}`); // <-- 로그 추가
  console.log("Current Categories:", categories); // <-- 로그 추가
}

/**
 * 카테고리 입력창에서 키보드 입력 시 실행되는 이벤트 핸들러
 */
function handleCategoryKeyup(event) {
  if (event.key === 'Enter') addCategory();
}


/**
 * 카테고리를 삭제하고, 해당 카테고리를 사용하던 Todo 항목을 "미지정"으로 변경합니다.
 */
function removeCategory(name) {
  if (name === "미지정") {
    showNotification('기본 카테고리("미지정")는 삭제할 수 없습니다.', '#f0ad4e');
    return;
  }

  // 배열에서 카테고리 제거
  categories = categories.filter(c => c.name !== name);

  // 삭제된 카테고리를 사용하던 Todo 항목 업데이트
  const defaultCategory = categories.find(c => c.name === "미지정");

  todoList.forEach(item => {
    if (item.category === name) {
      item.category = defaultCategory.name;
      item.color = defaultCategory.color;
    }
  });

  // UI 업데이트
  populateCategoryList();
  populateCategories();
  sortAndShowList();

  showNotification(`'${name}' 카테고리가 삭제되었습니다.`, '#d9534f');
  console.log(`[Category Removed] Name: ${name}`); // <-- 로그 추가
  console.log("Remaining Categories:", categories); // <-- 로그 추가
}

/**
 * 카테고리 관리 섹션에 현재 카테고리 목록 칩을 표시합니다.
 */
function populateCategoryList() {
  const display = document.getElementById('category-list-display');
  display.innerHTML = '';

  categories.forEach(category => {
    const chip = document.createElement('span');
    chip.classList.add('category-chip');
    chip.textContent = category.name;
    chip.style.backgroundColor = category.color;

    // 삭제 버튼
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.title = `${category.name} 카테고리 삭제`;
    deleteButton.onclick = () => removeCategory(category.name);

    // "미지정" 카테고리는 삭제 버튼 숨김
    if (category.name !== '미지정') {
      chip.appendChild(deleteButton);
    }

    display.appendChild(chip);
  });
}

/**
 * 카테고리 드롭다운 옵션을 동적으로 생성합니다.
 */
function populateCategories() {
  const select = document.getElementById('category-select');
  select.innerHTML = '';

  // 기본 옵션 추가
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '카테고리 선택';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  // 정의된 카테고리 옵션 추가
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

// --- 4. 데이터 조작 및 렌더링 로직 (기존 로직 유지) ---

/**
 * 현재 선택된 정렬 기준에 따라 todoList를 정렬하고 화면을 업데이트합니다.
 */
function sortAndShowList() {
  const sortBy = document.getElementById('sort-by').value;

  // 1. 데이터 정렬
  const sortedList = [...todoList].sort((a, b) => {
    // 완료된 항목은 항상 목록의 끝으로 보냅니다.
    if (a.done !== b.done) {
      return a.done ? 1 : -1;
    }

    if (sortBy === 'dueDateAsc') {
      // 마감일 빠른 순 (오름차순)
      const dateA = new Date(a.dueDate || '9999-12-31');
      const dateB = new Date(b.dueDate || '9999-12-31');
      return dateA - dateB;
    } else if (sortBy === 'dueDateDesc') {
      // 마감일 늦은 순 (내림차순)
      const dateA = new Date(a.dueDate || '0000-01-01');
      const dateB = new Date(b.dueDate || '0000-01-01');
      return dateB - dateA;
    } else if (sortBy === 'category') {
      // 카테고리 이름 순
      return a.category.localeCompare(b.category);
    } else if (sortBy === 'idDesc') {
      // 최신 순 (ID 내림차순)
      return b.id - a.id;
    }
    return 0;
  });

  // 2. 화면 출력
  const todoListUl = document.getElementById('todolist-ul');
  todoListUl.innerHTML = '';

  if (sortedList.length === 0) {
    todoListUl.innerHTML = '<li style="text-align: center; color: #888; padding: 20px;">할 일이 없습니다!</li>';
    return;
  }

  sortedList.forEach(item => {
    todoListUl.appendChild(getTodoItemElem(item));
  });
}

/**
 * 새로운 Todo 아이템을 목록에 추가하는 함수
 */
function addItem() {
  const titleInput = document.getElementById('todo-title-input');
  const categorySelect = document.getElementById('category-select');
  const dueDateInput = document.getElementById('due-date-input');

  const title = titleInput.value.trim();
  const selectedCategoryName = categorySelect.value;
  const dueDate = dueDateInput.value;

  if (title === '') {
    showNotification('할 일 제목을 입력해주세요.', '#d9534f');
    return;
  }
  if (selectedCategoryName === '') {
    showNotification('카테고리를 선택해주세요.', '#d9534f');
    return;
  }

  const selectedCategory = categories.find(c => c.name === selectedCategoryName);

  const newItem = {
    id: ++lastNo,
    title: title,
    done: false,
    category: selectedCategory.name,
    color: selectedCategory.color,
    dueDate: dueDate
  };

  todoList.push(newItem);
  sortAndShowList();

  // 입력 필드 초기화
  titleInput.value = '';
  dueDateInput.value = '';
  categorySelect.selectedIndex = 0;
  titleInput.focus();

  console.log(`[Todo Added] ID: ${newItem.id}, Title: ${newItem.title}, Category: ${newItem.category}`); // <-- 로그 추가
  console.log("Current Todo List:", todoList); // <-- 로그 추가
}

/**
 * Todo 아이템 하나를 삭제하는 함수
 */
function removeItem(id) {
  todoList = todoList.filter(item => item.id !== id);
  sortAndShowList();
  console.log(`[Todo Removed] ID: ${id}`); // <-- 로그 추가
  console.log("Current Todo List:", todoList); // <-- 로그 추가
}

/**
 * Todo 아이템의 완료/미완료 상태를 토글하는 함수
 */
function toggleDone(id) {
  const item = todoList.find(item => item.id === id);
  if (item) {
    item.done = !item.done;
    sortAndShowList();
    console.log(`[Todo Toggled] ID: ${id}, Done: ${item.done}`); // <-- 로그 추가
  }
}

// --- 5. 이벤트 핸들러 및 초기화 ---

/**
 * 추가 버튼 클릭 시 실행되는 이벤트 핸들러
 */
function add() {
  addItem();
}

/**
 * 입력창에서 키보드 입력 시 실행되는 이벤트 핸들러
 */
function handleKeyup(event) {
  if (event.key === 'Enter') add();
}

/**
 * 사용자에게 메시지를 보여주는 임시 알림 함수 (alert() 대체)
 */
function showNotification(message, color) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background-color: ${color};
                color: white;
                border-radius: 5px;
                z-index: 2000; /* 모달 위에 표시되도록 z-index를 높임 */
                opacity: 0;
                transition: opacity 0.5s, transform 0.5s;
                transform: translateY(-20px);
            `;
  document.body.appendChild(notification);

  // 표시
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  // 3초 후 제거
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.addEventListener('transitionend', () => notification.remove());
  }, 3000);
}

// 애플리케이션 초기화
window.onload = function () {
  console.log("Todo List Application Initialized."); // <-- 로그 추가
  // 초기 카테고리 목록에 "미지정" 기본값 추가 (삭제 불가능)
  if (!categories.some(c => c.name === "미지정")) {
    categories.push({ name: "미지정", color: "#999" });
  }

  populateCategoryList();
  populateCategories();
  sortAndShowList();
};

// // 전역 스코프에 함수 노출
// window.add = add;
// window.handleKeyup = handleKeyup;
// window.sortAndShowList = sortAndShowList;
// window.removeItem = removeItem;
// window.openCategoryModal = openCategoryModal; // 모달 기능 노출
// window.closeCategoryModal = closeCategoryModal;
// window.addCategory = addCategory;
// window.handleCategoryKeyup = handleCategoryKeyup;