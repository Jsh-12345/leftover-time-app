# 틈새 — 자투리 시간 할 일 추천

배낭 문제(Knapsack) 알고리즘으로 자투리 시간에 할 일을 추천해주는 웹앱입니다.

## 핵심 아이디어

할 일을 두 종류로 나눕니다.

- **끝까지 해야 하는 일** → 0/1 배낭 문제 (통째로 하거나 아예 안 하거나)
- **끊어도 되는 일** → 분수 배낭 문제 (남는 시간만큼만 부분적으로)

두 종류를 자투리 시간 안에서 함께 최적화하는 로직은 `src/lib/knapsack.js`에
UI와 완전히 분리된 순수 함수로 들어있습니다.

## 로컬에서 실행하기

```bash
npm install
npm run dev
```

터미널에 뜨는 주소(예: http://localhost:5173)를 브라우저에서 열면 됩니다.

## 빌드

```bash
npm run build
```

`dist` 폴더에 결과물이 생성됩니다.

## 배포 (Vercel 예시)

1. GitHub에 이 프로젝트를 올립니다.
2. vercel.com에 GitHub 계정으로 가입 후 저장소를 선택합니다.
3. Framework Preset은 자동으로 "Vite"가 잡힙니다. Deploy를 누르면 끝입니다.

## 폴더 구조

```
src/
  App.jsx                 화면 전체 구성
  components/
    TaskForm.jsx           할 일 추가 폼
    TaskList.jsx           등록된 할 일 목록
    TimeBar.jsx            추천 결과 시각화 (시간 막대)
  lib/
    knapsack.js             배낭 알고리즘 (핵심 로직)
    useLocalStorage.js       브라우저 저장을 위한 훅
```

## 데이터 저장

모든 할 일은 브라우저의 localStorage에 저장됩니다. 별도 서버나 회원가입이 필요 없고,
같은 브라우저에서는 새로고침해도 유지됩니다. (단, 다른 기기와는 동기화되지 않습니다.)
