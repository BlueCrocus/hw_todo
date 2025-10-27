# 📘 Todo List Web App (Vanilla JavaScript)

이 프로젝트는 **순수 JavaScript, HTML, CSS**만으로 만든 **할 일 관리(To-Do List)** 애플리케이션입니다.  
카테고리별로 할 일을 관리하고, 마감일을 설정하거나 완료 상태를 표시할 수 있습니다.  
이 버전에서는 **수정 기능(✏️)**과 **LocalStorage 저장 기능**이 새로 추가되었습니다.

---

## 🚀 주요 기능 요약

| 기능 | 설명 |
|------|------|
| ✅ 할 일 추가 | 제목, 카테고리, 마감일을 입력하여 새 할 일 추가 |
| ✏️ 할 일 수정 | 기존 항목을 클릭하여 제목 수정 (Enter/✔ 저장, Esc/취소) |
| 🗑️ 할 일 삭제 | 리스트에서 특정 항목 삭제 |
| ✔️ 완료/미완료 토글 | 클릭으로 할 일 상태 변경 |
| 🗂️ 카테고리 추가/삭제 | 색상과 함께 카테고리 생성 및 관리 |
| 💾 LocalStorage 저장 | 새로고침 후에도 데이터 유지 |
| 📅 마감일 표시 및 경고 | 기한이 지난 항목은 빨간색으로 표시 |
| 🔔 사용자 알림 | 브라우저 `alert()` 대신 부드러운 시각적 알림 표시 |
| ⚙️ 정렬 기능 | 마감일, 카테고리, 최신순 등으로 정렬 가능 |

---

## 📁 1. 데이터 구조

### 📌 카테고리 (`categories`)
```js
let categories = [
  { name: "업무", color: "#DFF2D8" },
  { name: "개인", color: "#F4BBD3" },
  { name: "학습", color: "#F686BD" }
];
```
- 각 카테고리는 이름(`name`)과 색상(`color`)을 가집니다.
- `"미지정"` 카테고리는 항상 기본으로 존재하며, 삭제할 수 없습니다.

---

### 📌 할 일 목록 (`todoList`)
```js
let todoList = [
  { id: 1, title: "JavaScript 복습", done: false, category: "학습", color: "#F686BD", dueDate: "2025-11-10" },
  ...
];
```

| 속성 | 설명 |
|------|------|
| `id` | 고유 식별자 |
| `title` | 할 일 내용 |
| `done` | 완료 여부 |
| `category` | 소속 카테고리 이름 |
| `color` | 카테고리 색상 |
| `dueDate` | 마감일 |

---

## 🧩 2. 주요 함수 요약

### 🧱 getTodoItemElem(item)
> 하나의 Todo 객체를 `<li>` 요소로 만들어 화면에 표시합니다.

- 제목, 카테고리, 마감일 표시  
- 완료 항목은 회색 처리  
- 마감일이 지났으면 **빨간색 경고 표시**  
- 오른쪽에 ✏️(수정), ❌(삭제) 버튼 표시  
- 항목 전체를 클릭하면 완료 상태 토글

---

### ✏️ 수정 관련 함수

| 함수 | 설명 |
|------|------|
| `editItem(id)` | 항목을 편집 모드로 변경 |
| `updateItemTitle(id, newTitle)` | 입력값을 저장 후 목록 갱신 |
| **편집 중 키 이벤트** | `Enter` → 저장 / `Esc` → 취소 |

> 완료된 항목은 수정할 수 없습니다.  
> 수정 후에는 자동으로 `LocalStorage`에 저장됩니다.

---

### 🗂️ 카테고리 관련 함수

| 함수 | 설명 |
|------|------|
| `openCategoryModal()` | 카테고리 추가 모달 열기 |
| `closeCategoryModal(event)` | 모달 닫기 |
| `addCategory()` | 새 카테고리 추가 (중복 방지 및 알림 표시) |
| `removeCategory(name)` | 카테고리 삭제 및 관련 Todo 자동 변경 |
| `populateCategoryList()` | 화면에 카테고리 칩 표시 |
| `populateCategories()` | `<select>` 드롭다운 동기화 |

---

### 💾 저장 관련 함수

| 함수 | 설명 |
|------|------|
| `saveToLocalStorage()` | 현재 `todoList`와 `categories`를 브라우저에 저장 |
| `loadFromLocalStorage()` | 저장된 데이터를 불러와 복원 |

> 저장은 **항목 추가, 삭제, 수정, 상태 변경, 카테고리 변경** 시마다 자동으로 이루어집니다.

---

### 🧮 데이터 조작 및 렌더링

| 함수 | 역할 | 설명 |
|------|------|------|
| `sortAndShowList()` | 목록 정렬 및 화면 갱신 | 완료 여부, 마감일, 카테고리, 최신순 정렬 가능 |
| `addItem()` | 새 할 일 추가 | 입력 검증 및 UI 업데이트 포함 |
| `removeItem(id)` | 할 일 삭제 | 지정 ID 제거 후 목록 다시 그리기 |
| `toggleDone(id)` | 완료 상태 토글 | 클릭 시 `done` 값 반전 및 저장 |

---

### 💬 사용자 피드백

#### `showNotification(message, color)`
- alert() 대신 오른쪽 상단에 표시되는 알림창  
- 3초 뒤 자동으로 사라짐  
예시:
```js
showNotification('새 할 일이 추가되었습니다.', '#5cb85c');
```

---

## ⚙️ 3. 실행 및 초기화

```js
window.onload = function () {
  loadFromLocalStorage();
  if (!categories.some(c => c.name === "미지정")) {
    categories.push({ name: "미지정", color: "#999" });
    saveToLocalStorage();
  }

  populateCategoryList();
  populateCategories();
  sortAndShowList();
};
```

- 페이지 로드시 저장된 데이터를 불러옵니다.  
- `"미지정"` 기본 카테고리가 없으면 자동 추가됩니다.

---

## 🧠 4. 이벤트 연결

| 함수 | 트리거 | 동작 |
|------|---------|------|
| `add()` | “추가” 버튼 클릭 | `addItem()` 실행 |
| `handleKeyup(event)` | Enter 키 입력 | `add()` 실행 |
| `handleCategoryKeyup(event)` | 카테고리 입력창에서 Enter | `addCategory()` 실행 |

전역으로 노출된 함수들:
```js
window.add = add;
window.handleKeyup = handleKeyup;
window.sortAndShowList = sortAndShowList;
window.removeItem = removeItem;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.addCategory = addCategory;
window.handleCategoryKeyup = handleCategoryKeyup;
window.editItem = editItem;
```

---

## 🎨 5. UI 특징

- 카테고리 색상에 따라 왼쪽 border 색상 표시  
- 완료 항목은 흐리게 표시  
- 마감일이 지난 항목은 **빨간색 굵은 글씨**로 표시  
- 수정 모드에서는 입력창 + ✔ / X 버튼 표시  
- 모든 알림은 부드럽게 fade-in/out 애니메이션 적용  
- 알림창은 **모달보다 위(z-index 2000)** 에 표시됨  

---

## 📚 6. 실행 흐름 요약

1. 페이지 로드 → `loadFromLocalStorage()`  
2. `"미지정"` 카테고리 보정  
3. 카테고리 목록 및 select 초기화  
4. 할 일 목록 정렬 후 렌더링  
5. 사용자 입력으로 추가/삭제/수정/토글  
6. 모든 변경 사항 자동 저장  

---

## 🧭 7. 확장 아이디어

- **검색 기능** 추가 (제목으로 필터링)  
- **기한별 정렬/필터** 추가  
- **태그/우선순위 기능** 추가  
- **반응형 디자인** 및 다크모드  
- **Firebase 연동**으로 실시간 동기화  

---

> 💡 이 프로젝트는 “**Vanilla JS로 완전한 CRUD 앱 만들기**”의 좋은 예시입니다.  
> 코드 구조를 이해하고 직접 기능을 추가하면서 자바스크립트 동적 UI 원리를 익혀보세요.
