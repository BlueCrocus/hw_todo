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

// ----------------------------------------------------------------------
// --- 로컬 스토리지 저장 및 불러오기 함수 --- 
// ----------------------------------------------------------------------

/**
 * 현재 todoList 및 categories 데이터를 localStorage에 저장
 */
function saveToLocalStorage() {
  localStorage.setItem('todoList', JSON.stringify(todoList));
  localStorage.setItem('categories', JSON.stringify(categories));
  console.log("Data saved to LocalStorage.");
}

/**
 * localStorage에서 데이터를 불러와 전역 변수를 초기화
 */
function loadFromLocalStorage() {
  const savedTodos = localStorage.getItem('todoList');
  const savedCategories = localStorage.getItem('categories');

  if (savedTodos) {
    todoList = JSON.parse(savedTodos);
    // lastNo 업데이트
    lastNo = todoList.length > 0 ? Math.max(...todoList.map(item => item.id)) : 0;
    console.log("Todo List loaded from LocalStorage.");
  } else {
    // 저장된 데이터가 없으면 초기 데이터로 저장
    saveToLocalStorage();
  }

  if (savedCategories) {
    categories = JSON.parse(savedCategories);
    console.log("Categories loaded from LocalStorage.");
  }
}

// ----------------------------------------------------------------------
// --- 2. DOM 요소 생성 및 헬퍼 함수 ---
// ----------------------------------------------------------------------

/**
 * Todo 아이템 객체를 전달받아 화면에 표현하는 li 요소를 생성하는 함수
 */
function getTodoItemElem(item) {
  const liElem = document.createElement('li');
  liElem.id = `todo-${item.id}`;
  liElem.dataset.id = item.id;
  // 강사님 코드와 일관성을 위해 data-done 속성 추가
  liElem.dataset.done = item.done.toString();
  liElem.classList.add('todo-item');
  if (item.done) {
    liElem.classList.add('done');
  }
  // 카테고리 색상으로 왼쪽 border 설정
  item.color = categories.find(c => c.name === item.category)?.color || "#999";
  liElem.style.borderLeftColor = item.color;

  // 제목, 카테고리, 마감일 컨테이너
  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('item-details');

  // 제목 클릭 시 완료 처리 허용
  liElem.addEventListener('click', (e) => {
    // 버튼, 입력 필드 등 '편집'과 관련된 요소가 아닌 경우에만 toggleDone 실행
    if (
      !e.target.closest('.item-controls') &&
      !e.target.classList.contains('delete-button') &&
      !e.target.classList.contains('edit-button') &&
      !e.target.classList.contains('save-button') &&
      !e.target.classList.contains('cancel-button') &&
      !e.target.classList.contains('edit-todo-input') &&
      !e.target.classList.contains('move-button') &&
      e.target.tagName !== 'SELECT'
    ) {
      // data-id는 문자열이므로 Number로 변환
      toggleDone(Number(liElem.dataset.id));
    }
  });

  // 1. 카테고리 태그
  const categoryTag = document.createElement('span');
  categoryTag.classList.add('category-tag');
  categoryTag.textContent = item.category;
  categoryTag.style.backgroundColor = item.color;
  detailsDiv.appendChild(categoryTag);

  // 2. 제목
  const titleElem = document.createElement('span');
  titleElem.classList.add('todo-title');
  // 완료된 항목은 <s> 태그로 감싸서 생성
  if (item.done) {
    const sElem = document.createElement('s');
    sElem.textContent = item.title;
    titleElem.appendChild(sElem);
  } else {
    titleElem.textContent = item.title;
  }
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

  // --- 버튼 컨테이너 추가 ---
  const controlsDiv = document.createElement('div');
  controlsDiv.classList.add('item-controls');

  /* 🔥 4-A. 위로 이동 버튼 (⬆️) 추가 */
  const moveUpElem = document.createElement('button');
  moveUpElem.type = 'button';
  moveUpElem.textContent = '⬆️';
  moveUpElem.classList.add('control-button', 'move-button', 'move-up-button');
  moveUpElem.title = '위로 이동';
  moveUpElem.addEventListener('click', (e) => {
    e.stopPropagation();
    moveItem(item.id, 'up');
  });
  controlsDiv.appendChild(moveUpElem);

  /* 🔥 4-B. 아래로 이동 버튼 (⬇️) 추가 */
  const moveDownElem = document.createElement('button');
  moveDownElem.type = 'button';
  moveDownElem.textContent = '⬇️';
  moveDownElem.classList.add('control-button', 'move-button', 'move-down-button');
  moveDownElem.title = '아래로 이동';
  moveDownElem.addEventListener('click', (e) => {
    e.stopPropagation();
    moveItem(item.id, 'down');
  });
  controlsDiv.appendChild(moveDownElem);


  // 5. 수정 버튼 (✏️)
  const editElem = document.createElement('button');
  editElem.type = 'button';
  editElem.textContent = '✏️';
  editElem.classList.add('control-button', 'edit-button');
  editElem.title = '할 일 수정';
  editElem.addEventListener('click', (e) => {
    e.stopPropagation();
    editItem(item.id);
  });
  controlsDiv.appendChild(editElem);

  // 6. 삭제 버튼 (x)
  const deleteElem = document.createElement('button');
  deleteElem.type = 'button';
  deleteElem.textContent = 'x';
  deleteElem.classList.add('control-button', 'delete-button');
  deleteElem.title = '삭제';
  deleteElem.addEventListener('click', (e) => {
    e.stopPropagation();
    removeItem(item.id);
  });
  controlsDiv.appendChild(deleteElem);

  liElem.appendChild(detailsDiv);
  liElem.appendChild(controlsDiv);

  return liElem;
}

// ----------------------------------------------------------------------
// --- 3. 카테고리 관리 로직  ---
// ----------------------------------------------------------------------

/**
 * 모달 열기
 */
function openCategoryModal() {
  document.getElementById('category-modal-overlay').style.display = 'flex';
  setTimeout(() => {
    document.getElementById('category-modal-overlay').classList.add('active');
  }, 10);
  document.getElementById('new-category-name').focus();
  console.log("Category Modal Opened.");
}

/**
 * 모달 닫기
 */
function closeCategoryModal() {
  const overlay = document.getElementById('category-modal-overlay');
  overlay.classList.remove('active');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);
  console.log("Category Modal Closed.");
}

/**
 * 새로운 카테고리를 추가.
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
  saveToLocalStorage();

  // 입력 필드 초기화
  nameInput.value = '';
  colorInput.value = '#3b82f6'; // 초기값으로 리셋
  nameInput.focus();

  showNotification(`'${name}' 카테고리가 추가되었습니다.`, '#5cb85c');
  console.log(`[Category Added] Name: ${name}, Color: ${color}`);
}

/**
 * 카테고리 입력창에서 키보드 입력 시 실행되는 이벤트 핸들러
 */
function handleCategoryKeyup(event) {
  if (event.key === 'Enter') addCategory();
}


/**
 * 카테고리를 삭제하고, 해당 카테고리를 사용하던 Todo 항목을 "미지정"으로 변경
 */
function removeCategory(name) {
  if (name === "미지정") {
    showNotification('기본 카테고리("미지정")는 삭제할 수 없습니다.', '#f0ad4e');
    return;
  }

  // 배열에서 카테고리 제거
  categories = categories.filter(c => c.name !== name);

  // "미지정" 카테고리 확인 
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
  saveToLocalStorage();

  showNotification(`'${name}' 카테고리가 삭제되었습니다.`, '#d9534f');
  console.log(`[Category Removed] Name: ${name}`);
}

/**
 * 카테고리 관리 섹션에 현재 카테고리 목록 칩을 표시
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
    deleteButton.addEventListener('click', () => removeCategory(category.name));

    // "미지정" 카테고리는 삭제 버튼 숨김
    if (category.name !== '미지정') {
      chip.appendChild(deleteButton);
    }

    display.appendChild(chip);
  });
}

/**
 * 카테고리 드롭다운 옵션을 동적으로 생성
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

// ----------------------------------------------------------------------
// --- 4. 데이터 조작 및 렌더링 로직 (toggleDone, moveItem 추가됨) ---
// ----------------------------------------------------------------------

/**
 * Todo 아이템의 제목, 카테고리, 마감일을 업데이트하고 화면을 갱신하는 함수 (수정 로직)
 */
function updateItem(id, newTitle, newCategory, newDueDate) {
  const item = todoList.find(item => item.id === id);
  if (item) {
    // 1. 데이터 업데이트
    item.title = newTitle.trim();
    item.category = newCategory;
    item.dueDate = newDueDate;

    // 2. 카테고리 색상도 업데이트
    item.color = categories.find(c => c.name === newCategory)?.color || "#999";

    // 3. UI 및 저장
    sortAndShowList();
    saveToLocalStorage();
    showNotification(`할 일 정보가 수정되었습니다.`, '#28a745');
    console.log(`[Todo Updated] ID: ${id}, Title: ${item.title}, Category: ${item.category}, Due Date: ${item.dueDate}`);
  }
}


/**
 * 특정 Todo 항목을 편집 가능한 모드로 전환하는 함수 (✏️ 버튼 클릭 시)
 */
function editItem(id) {
  const item = todoList.find(i => i.id === id);
  if (!item) return;

  const liElem = document.getElementById(`todo-${id}`);
  const titleElem = liElem.querySelector('.todo-title');
  const dueDateElem = liElem.querySelector('.due-date');
  const categoryTag = liElem.querySelector('.category-tag');
  const detailsDiv = liElem.querySelector('.item-details');
  const controlsDiv = liElem.querySelector('.item-controls');

  // 완료된 항목 수정 방지
  if (item.done) {
    showNotification('완료된 항목은 수정할 수 없습니다.', '#f0ad4e');
    return;
  }

  // --- 1. 기존 항목을 입력 필드로 대체 ---

  // 1-1. 제목 입력 필드
  const editTitleInput = document.createElement('input');
  editTitleInput.type = 'text';
  editTitleInput.value = item.title;
  editTitleInput.classList.add('edit-todo-input');
  editTitleInput.placeholder = '할 일 제목';
  editTitleInput.maxLength = 30; // maxlength="30" 추가

  // 1-2. 마감일 입력 필드
  const editDateInput = document.createElement('input');
  editDateInput.type = 'date';
  editDateInput.value = item.dueDate;
  editDateInput.classList.add('edit-todo-input');
  editDateInput.style.maxWidth = '150px';
  editDateInput.placeholder = '마감일';

  // 1-3. 카테고리 선택 필드 
  const editCategorySelect = document.createElement('select');
  editCategorySelect.id = `edit-category-${id}`;
  editCategorySelect.classList.add('edit-todo-input');
  editCategorySelect.style.maxWidth = '150px';

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    if (category.name === item.category) {
      option.selected = true;
    }
    editCategorySelect.appendChild(option);
  });

  // 기존 요소들을 새 입력 요소로 교체
  detailsDiv.replaceChild(editTitleInput, titleElem);
  detailsDiv.replaceChild(editCategorySelect, categoryTag);
  detailsDiv.replaceChild(editDateInput, dueDateElem);

  editTitleInput.focus();

  // --- 2. 컨트롤 버튼 변경: 저장/취소 버튼으로 대체 ---
  controlsDiv.innerHTML = '';

  // 2-1. 저장 버튼 (✔)
  const saveButton = document.createElement('button');
  saveButton.textContent = '✔';
  saveButton.classList.add('control-button', 'save-button');
  saveButton.title = '저장';
  saveButton.addEventListener('click', () => {
    const newTitle = editTitleInput.value.trim();
    const newCategory = editCategorySelect.value;
    const newDueDate = editDateInput.value;

    if (newTitle === '') {
      showNotification('제목은 비워둘 수 없습니다.', '#d9534f');
      return;
    }

    // 30자 제한 유효성 검사
    if (newTitle.length > 30) {
      showNotification('할 일 제목은 30글자를 초과할 수 없습니다.', '#d9534f');
      return;
    }

    if (newCategory === '') {
      showNotification('카테고리를 선택해주세요.', '#d9534f');
      return;
    }

    updateItem(id, newTitle, newCategory, newDueDate);
  });
  controlsDiv.appendChild(saveButton);

  // 2-2. 취소 버튼 (X)
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'X';
  cancelButton.classList.add('control-button', 'cancel-button');
  cancelButton.title = '취소';
  cancelButton.addEventListener('click', () => sortAndShowList()); // 취소 시 원래 상태로 복원
  controlsDiv.appendChild(cancelButton);

  // 3. Enter/Escape 키 이벤트 처리
  const handleEditKeyup = (e) => {
    if (e.key === 'Enter') {
      saveButton.click();
    } else if (e.key === 'Escape') {
      cancelButton.click();
    }
  };
  editTitleInput.addEventListener('keyup', handleEditKeyup);
  editDateInput.addEventListener('keyup', handleEditKeyup);
}


/**
 * 현재 선택된 정렬 기준에 따라 todoList를 정렬하고 화면을 업데이트
 */
function sortAndShowList() {
  const searchInput = document.getElementById('search-input');

  if (searchInput && searchInput.value.trim() !== '') {
    filterTodoList();
    return;
  }

  const sortBy = document.getElementById('sort-by').value;

  // 1. 데이터 정렬
  const sortedList = [...todoList].sort((a, b) => {
    if (sortBy === 'manual') {
      if (a.done !== b.done) {
        return a.done ? 1 : -1;
      }
      return 0;
    } else {
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

  // 🚨 30자 제한 유효성 검사 (등록 시점 최종 확인 로직)
  if (title.length > 30) {
    showNotification('할 일 제목은 30글자를 초과할 수 없습니다.', '#d9534f');
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
  saveToLocalStorage();

  // 입력 필드 초기화
  titleInput.value = '';
  dueDateInput.value = '';
  categorySelect.selectedIndex = 0;
  titleInput.focus();

  showNotification('할 일이 성공적으로 추가되었습니다.', '#5cb85c'); // 추가 알림
  console.log(`[Todo Added] ID: ${newItem.id}, Title: ${newItem.title}, Category: ${newItem.category}`);
}

/**
 * Todo 아이템 하나를 삭제하는 함수
 */
function removeItem(id) {
  todoList = todoList.filter(item => item.id !== id);
  sortAndShowList();
  saveToLocalStorage();
  showNotification('할 일이 삭제되었습니다.', '#d9534f'); // 삭제 알림
  console.log(`[Todo Removed] ID: ${id}`);
}

/**
 * Todo 아이템의 완료/미완료 상태를 토글하는 함수
 * @param {number} id - 토글할 Todo 아이템의 번호(id)
 */
function toggleDone(id) {
  const item = todoList.find(item => item.id === id);
  if (!item) return;

  const targetLi = document.getElementById(`todo-${id}`);

  // 1. DOM에서 현재 상태를 읽어옴
  const beforeDone = targetLi.dataset.done; // 'true'/'false'
  const isDone = beforeDone === 'true' ? false : true;

  const titleEl = targetLi.querySelector('.todo-title');
  const notificationMsg = isDone ? '할 일을 완료했습니다! 🎉' : '할 일을 미완료로 변경했습니다.';

  if (isDone) {
    const sElem = document.createElement('s');
    sElem.textContent = titleEl.textContent;
    titleEl.textContent = ''; 
    titleEl.appendChild(sElem);
    targetLi.classList.add('done'); 
  } else {
    const sElem = titleEl.firstElementChild;
    if (sElem && sElem.tagName === 'S') {
      titleEl.textContent = sElem.textContent;
      sElem.remove();
    }
    targetLi.classList.remove('done');
  }

  // 2. DOM의 data-done 속성 업데이트
  targetLi.dataset.done = isDone.toString();

  // 3. 데이터 배열 업데이트 (정렬, 검색, 저장 시 사용됨)
  item.done = isDone;

  // 4. UI 갱신 (정렬만 다시 수행하여 완료 항목을 아래로 이동)
  sortAndShowList();

  // 5. 로컬 스토리지에 데이터 저장
  saveToLocalStorage();

  // 6. 사용자에게 알림
  showNotification(notificationMsg, '#5cb85c');
  console.log(`[Todo Toggled] ID: ${id}, Done: ${item.done}`);
}


/**
 * Todo 목록을 검색어 기준으로 필터링하여 화면에 표시합니다.
 */
function filterTodoList() {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  const todoListUl = document.getElementById('todolist-ul');
  todoListUl.innerHTML = '';

  // 1. 현재 정렬된 목록을 가져옴
  const sortBy = document.getElementById('sort-by').value;
  const sortedList = [...todoList].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;

    if (sortBy === 'manual') return 0;

    if (sortBy === 'dueDateAsc') {
      const dateA = new Date(a.dueDate || '9999-12-31');
      const dateB = new Date(b.dueDate || '9999-12-31');
      return dateA - dateB;
    } else if (sortBy === 'dueDateDesc') {
      const dateA = new Date(a.dueDate || '0000-01-01');
      const dateB = new Date(b.dueDate || '0000-01-01');
      return dateB - dateA;
    } else if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    } else if (sortBy === 'idDesc') {
      return b.id - a.id;
    }
    return 0;
  });

  // 2. 검색어 필터링
  const filteredList = sortedList.filter(item =>
    item.title.toLowerCase().includes(query)
  );

  // 3. 화면 출력
  if (filteredList.length === 0) {
    todoListUl.innerHTML = `<li style="text-align: center; color: #888; padding: 20px;">'${query}'에 대한 검색 결과가 없습니다.</li>`;
    return;
  }

  filteredList.forEach(item => {
    todoListUl.appendChild(getTodoItemElem(item));
  });
}

/* -------------------------------------------------------------------
 *  새로 추가된 항목 이동 로직
 * ------------------------------------------------------------------- */

/**
 * Todo 항목의 순서를 변경하고 화면을 갱신하는 함수
 * @param {number} id - 이동할 Todo 항목의 id
 * @param {string} direction - 'up' 또는 'down'
 */
function moveItem(id, direction) {
  // 1. 현재 항목의 인덱스 찾기
  const index = todoList.findIndex(item => item.id === id);

  if (index === -1) return; // 항목이 없으면 종료

  let newIndex = index;

  // 2. 새로운 인덱스 계산
  if (direction === 'up') {
    newIndex = index - 1;
  } else if (direction === 'down') {
    newIndex = index + 1;
  }

  // 3. 배열 범위 유효성 검사 (첫 항목에서 위로, 마지막 항목에서 아래로 이동 방지)
  if (newIndex < 0 || newIndex >= todoList.length) {
    return;
  }

  // 4. 배열 항목 위치 변경 (swap)
  const currentItem = todoList.splice(index, 1)[0];
  todoList.splice(newIndex, 0, currentItem);

  // 5. 수동 정렬을 위해 정렬 기준을 'manual'로 변경하고 UI 업데이트
  const sortBySelect = document.getElementById('sort-by');
  if (sortBySelect.value !== 'manual') {
    sortBySelect.value = 'manual'; // 정렬 기준을 'manual'로 설정
  }

  sortAndShowList(); // 정렬을 다시 수행하여 UI를 갱신
  saveToLocalStorage();
  showNotification(direction === 'up' ? '항목이 위로 이동했습니다.' : '항목이 아래로 이동했습니다.', '#007bff');
  console.log(`[Todo Moved] ID: ${id}, Direction: ${direction}, New Index: ${newIndex}`);
}


// ----------------------------------------------------------------------
// --- 5. 이벤트 핸들러 및 초기화 (변경 없음) ---
// ----------------------------------------------------------------------

/**
 * 할 일 제목 입력 시 30자 초과를 방지하고 알림을 표시하는 이벤트 핸들러
 */
function handleTitleInput(event) {
  const input = event.target;
  // 30자 제한을 초과했고, 입력된 키가 제어 키(백스페이스, 삭제, 화살표 등)가 아닌 경우
  if (input.value.length >= 30 && event.key.length === 1) {
    event.preventDefault(); // 입력 차단
    showNotification('할 일 제목은 30글자를 초과할 수 없습니다.', '#d9534f');
  }
}

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

  // 알림 위치: 화면 중앙
  notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 15px 30px;
        background-color: ${color};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.4s, transform 0.4s;
        white-space: nowrap;
        max-width: 80%;
        text-align: center;
        `;

  document.body.appendChild(notification);

  // 표시
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translate(-50%, -50%)';
  }, 10);

  // 3초 후 제거
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -30%)';
    notification.addEventListener('transitionend', () => notification.remove());
  }, 3000);
}

/**
 * 모든 DOM 이벤트 리스너를 연결하는 함수
 */
function setupEventListeners() {
  // 1. 할 일 추가 섹션
  document.getElementById('add-button').addEventListener('click', add);
  document.getElementById('todo-title-input').addEventListener('keyup', handleKeyup);

  // 30자 제한 알림을 위한 keydown 이벤트
  document.getElementById('todo-title-input').addEventListener('keydown', handleTitleInput);

  // 2. 정렬 및 검색 섹션
  document.getElementById('sort-by').addEventListener('change', sortAndShowList);
  document.getElementById('search-input').addEventListener('keyup', filterTodoList);

  // 3. 카테고리 모달 섹션
  document.getElementById('open-category-settings').addEventListener('click', openCategoryModal);
  document.getElementById('close-category-modal').addEventListener('click', closeCategoryModal);

  // 모달 오버레이 클릭 시 닫기 (자식 요소 클릭 방지)
  document.getElementById('category-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'category-modal-overlay') {
      closeCategoryModal();
    }
  });

  // 카테고리 추가
  document.getElementById('add-category-button').addEventListener('click', addCategory);
  document.getElementById('new-category-name').addEventListener('keyup', handleCategoryKeyup);

  console.log("All event listeners set up.");
}

// 애플리케이션 초기화
window.onload = function () {
  console.log("Todo List Application Initialized.");

  // 저장된 데이터를 먼저 불러옴
  loadFromLocalStorage();

  // 초기 카테고리 목록에 "미지정" 기본값 추가
  if (!categories.some(c => c.name === "미지정")) {
    categories.push({ name: "미지정", color: "#999" });
    saveToLocalStorage(); // 미지정 추가 후 저장
  }

  populateCategoryList();
  populateCategories();
  sortAndShowList();

  // 💡 모든 이벤트 리스너를 동적으로 연결
  setupEventListeners();
};