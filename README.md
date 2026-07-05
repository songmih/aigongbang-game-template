# AI공방 학생용 모바일 웹게임 템플릿

이 프로젝트는 학생들이 복사해서 자기 게임을 만들 때 사용할 기본 웹게임 템플릿입니다. HTML, CSS, JavaScript만 사용하며 GitHub Pages에 그대로 올릴 수 있습니다.

기본 예제 게임은 **별 먹기 게임**입니다. 플레이어 캐릭터를 움직여 제한 시간 안에 별을 많이 먹으면 됩니다.

## 실행 방법

1. `index.html`을 브라우저에서 엽니다.
2. 시작 버튼을 누르거나 Space 키를 누릅니다.
3. 방향키, WASD, 또는 모바일 터치 버튼으로 캐릭터를 움직입니다.

별도 서버, npm, 빌드 과정은 필요 없습니다.

## 배포 주소

https://songmih.github.io/aigongbang-game-template/

## 파일 구조

```text
aigongbang-game-template/
├─ index.html
├─ style.css
├─ script.js
├─ README.md
└─ assets/
   ├─ images/
   └─ sounds/
```

## 조작법

PC 키보드:

```text
방향키 또는 WASD: 이동
Space: 시작 또는 액션
P: 일시정지
R: 다시 시작
```

모바일 터치:

```text
[위]
[왼쪽] [아래] [오른쪽]
[시작]
[일시정지]
[다시하기]
```

## 모바일 테스트 방법

1. 브라우저 개발자도구의 모바일 화면에서 360px 너비로 확인합니다.
2. iPhone Safari, Galaxy Chrome, iPad Safari, Android Tablet Chrome에서 버튼이 손가락으로 누르기 편한지 확인합니다.
3. 세로 화면을 먼저 확인하고, 태블릿에서는 가로 화면도 확인합니다.
4. AI공방 아케이드 `play.html`의 iframe 안에서도 화면이 잘 맞는지 확인합니다.

## GitHub Pages 배포 방법

1. 이 폴더를 새 GitHub 저장소에 올립니다.
2. GitHub 저장소의 Settings로 이동합니다.
3. Pages 메뉴에서 배포 브랜치를 선택합니다.
4. 배포된 주소를 AI공방 아케이드 `games.json`의 `url`에 입력합니다.

## AI공방 아케이드 등록 정보 예시

```json
{
  "id": "star-catcher-student",
  "title": "별 먹기 게임",
  "creator": "학생 이름",
  "genre": "아케이드",
  "devices": ["PC", "모바일", "태블릿"],
  "players": "1인용",
  "status": "플레이 가능",
  "description": "제한 시간 안에 별을 많이 먹는 간단한 터치 게임입니다.",
  "url": "https://student-id.github.io/star-catcher/",
  "thumbnail": "",
  "tags": ["아케이드", "모바일", "터치"],
  "orientation": "portrait",
  "releaseUrl": "",
  "downloadable": false,
  "lanPlayable": false,
  "nearbyMultiplayer": false,
  "multiplayerType": "none",
  "platforms": ["Web", "iPhone", "Galaxy", "iPad", "Android Tablet"],
  "createdAt": "2026-07-05",
  "updatedAt": "2026-07-05"
}
```

## 멀티플레이 확장 시 데이터 최소화 규칙

나중에 멀티플레이로 확장할 때는 화면 전체를 보내지 말고, 입력값, 점수, 이벤트, 게임 상태처럼 작은 데이터만 보내야 합니다.

무료 클라우드는 방 만들기, 참가자 목록, 연결 정보 교환 정도에만 사용하고, 빠른 실시간 게임 데이터는 WebRTC DataChannel로 보내는 것을 권장합니다.

좋은 전송 예:

```json
{
  "type": "move",
  "playerId": "p1",
  "input": "left",
  "time": 12345
}
```

나쁜 방식:

```text
화면 전체 픽셀 정보 보내기
게임판 전체 상태를 초당 수십 번 클라우드에 저장하기
이미지나 사운드 파일을 실시간 데이터로 보내기
```

## 수정 팁

처음에는 `script.js`의 설정값부터 바꿔보세요. 제한 시간, 플레이어 속도, 별 크기만 바꿔도 다른 느낌의 게임을 만들 수 있습니다.
