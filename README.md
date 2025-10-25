# 📘 Todo List Web App (Vanilla JavaScript)

이 프로젝트는 **순수 JavaScript, HTML, CSS**만으로 만든 **할 일 관리(To-Do List)** 애플리케이션입니다.  
카테고리별로 할 일을 관리하고, 마감일을 설정하거나 완료 상태를 표시할 수 있습니다.

---

## 🚀 주요 기능 요약

| 기능 | 설명 |
|------|------|
| ✅ 할 일 추가 | 제목, 카테고리, 마감일을 입력하여 새 할 일 추가 |
| 🗑️ 할 일 삭제 | 리스트에서 특정 항목 삭제 |
| ✔️ 완료/미완료 토글 | 클릭으로 할 일 상태 변경 |
| 🗂️ 카테고리 추가/삭제 | 색상과 함께 카테고리 생성 및 관리 |
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
- 초기 실행 시 `"미지정"` 기본 카테고리가 자동 추가됩니다.

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
> 하나의 Todo 객체를 `<li>` HTML 요소로 만들어줍니다.
- 클릭 시 완료/미완료 토글
- 마감일이 지난 경우 빨간색 경고 표시
- 오른쪽에 “삭제” 버튼 표시

---

### 🗂️ 카테고리 관련 함수

| 함수 | 설명 |
|------|------|
| `openCategoryModal()` | 카테고리 추가 모달 열기 |
| `closeCategoryModal(event)` | 모달 닫기 |
| `addCategory()` | 새 카테고리 추가 (중복 방지 및 알림 표시) |
| `removeCategory(name)` | 카테고리 삭제 및 관련 Todo 자동 업데이트 |
| `populateCategoryList()` | 현재 카테고리 목록을 화면에 칩 형태로 표시 |
| `populateCategories()` | Todo 추가 폼의 `<select>` 옵션 동기화 |

> `"미지정"` 카테고리는 삭제할 수 없습니다.

---

### 🧮 데이터 조작 및 렌더링

| 함수 | 역할 | 설명 |
|------|------|------|
| `sortAndShowList()` | 목록 정렬 및 화면 갱신 | 완료 여부, 마감일, 카테고리, 최신순 정렬 가능 |
| `addItem()` | 새 할 일 추가 | 입력 검증 및 UI 업데이트 포함 |
| `removeItem(id)` | 할 일 삭제 | 지정 ID 제거 후 목록 다시 그리기 |
| `toggleDone(id)` | 완료 상태 토글 | 클릭 시 `done` 값 반전 |

---

### 💬 사용자 피드백

#### `showNotification(message, color)`
- alert() 대신 화면 오른쪽 위에 부드럽게 나타나는 알림창
- 3초 뒤 자동으로 사라짐  
예시:
```js
showNotification('새 할 일이 추가되었습니다.', '#5cb85c');
```

---

## ⚙️ 3. 실행 및 초기화

```js
window.onload = function () {
  if (!categories.some(c => c.name === "미지정")) {
    categories.push({ name: "미지정", color: "#999" });
  }

  populateCategoryList();
  populateCategories();
  sortAndShowList();
};
```
- 페이지가 로드되면 “미지정” 카테고리가 추가되고,
  UI가 자동으로 초기화됩니다.

---

## 🧠 4. 이벤트 연결

| 함수 | 트리거 | 동작 |
|------|---------|------|
| `add()` | “추가” 버튼 클릭 | `addItem()` 실행 |
| `handleKeyup(event)` | Enter 키 입력 | `add()` 실행 |
| `handleCategoryKeyup(event)` | 카테고리 입력창에서 Enter | `addCategory()` 실행 |

전역에서 접근 가능하도록 아래 함수들이 노출됩니다:
```js
window.add = add;
window.handleKeyup = handleKeyup;
window.sortAndShowList = sortAndShowList;
window.removeItem = removeItem;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.addCategory = addCategory;
window.handleCategoryKeyup = handleCategoryKeyup;
```

---

## 🎨 5. 스타일 및 UI 특징

- 카테고리 색상에 따라 할 일 항목 왼쪽 border 색상 표시
- 완료된 항목은 흐리게 처리
- 마감일이 지난 항목은 **빨간색 굵은 글씨**로 표시
- 알림창은 **모달보다 위(z-index 2000)** 에 표시

---

## 📚 6. 코드 실행 흐름 요약

1. **초기화 (`window.onload`)**
2. **카테고리 목록과 드롭다운 생성**
3. **할 일 목록 정렬 및 렌더링**
4. **사용자 입력 → addItem()**
5. **카테고리 관리 모달로 카테고리 추가/삭제**
6. **완료 상태/삭제 버튼으로 할 일 수정**

---

## 🧭 7. 개선 및 확장 아이디어

- **LocalStorage**로 데이터 저장 유지하기  
  → 새로고침 후에도 Todo 유지  
- **검색 및 필터 기능** 추가  
- **React/Vue로 리팩토링**  
  → Virtual DOM으로 효율적인 렌더링  
- **반응형 디자인** 적용  

---

> 💡 이 프로젝트는 “**자바스크립트로 동적 UI를 만드는 원리**”를 학습하기에 매우 좋은 예제입니다.  
> HTML/CSS 기본기를 알고 있다면 이 코드를 직접 수정해보면서 작동 원리를 익혀보세요.
