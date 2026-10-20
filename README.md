# StoryPhone — GitHub Pages용 스토리형 웹 아이폰

모바일 중심의 인터랙티브 웹 아이폰 프로토타입입니다. HTML/CSS/JS 기반이며 GitHub Pages에 배포할 수 있습니다.

## 들어 있는 기능

- iOS 스타일 잠금 화면, 시계, 알림, 홈 화면과 앱 아이콘
- 메시지 앱, 키워드 기반 자동 답장
- 사진 갤러리와 음악 플레이어
- 전화 키패드, 연락처, 시뮬레이션 통화
- 캘린더, 스토리용 Safari 검색 기록, 메모, 설정, 카메라 연출
- 관리자 패널에서 배경화면/메시지/사진/음악/일정/연락처 편집
- 선택 사항인 Supabase 공유 설정 및 관리자 로그인

## 1) GitHub Pages 배포

1. GitHub에서 새 **Public repository**를 만듭니다. 예: `storyphone`.
2. 이 폴더의 `index.html`, `config.example.js`, `README.md`, `supabase/` 폴더를 저장소 루트에 업로드합니다.
3. `config.example.js`를 복사해 `config.js` 파일을 만들고 저장소 루트에 둡니다.
4. 저장소에서 **Settings → Pages → Build and deployment**로 이동합니다.
5. **Deploy from a branch**, Branch `main`, Folder `/(root)`를 선택하고 저장합니다.
6. 배포 URL은 `https://YOUR-USERNAME.github.io/storyphone/` 형태입니다.

GitHub Pages 안내: https://docs.github.com/pages

## 2) 여러 방문자에게 같은 콘텐츠 공유하기 (Supabase)

기본적으로는 콘텐츠가 현재 브라우저에 저장됩니다. 다른 사람들에게 같은 설정을 제공하려면 다음 설정을 해야 합니다.

1. https://supabase.com/ 에서 프로젝트를 만듭니다.
2. Dashboard의 **SQL Editor**에서 `supabase/schema.sql` 내용을 실행합니다.
3. Project Settings / API에서 Project URL과 **anon/public key**를 가져와 `config.js`에 입력합니다.
4. Supabase Authentication에서 이메일/비밀번호 로그인을 활성화하고 관리자 계정을 만듭니다.
5. 해당 관리자 사용자의 `app_metadata`에 `role: "admin"`을 설정합니다. 이 역할은 클라이언트에서 임의로 설정하면 안 됩니다. Supabase의 신뢰된 관리자 도구/서버에서 설정하세요.
6. `config.js`를 GitHub 저장소에 업로드합니다. anon key는 브라우저 공개용이지만, 데이터 접근은 반드시 RLS 정책으로 제한해야 합니다.
7. GitHub Pages가 다시 배포되면 관리자 패널에서 로그인하고 콘텐츠를 저장합니다. 방문자에게는 게시된 설정이 읽기 전용으로 전달됩니다.

**절대 `service_role` 키를 `config.js`나 HTML에 넣지 마세요.** 관리자 역할을 부여하는 데 service-role key가 필요한 경우에도 Supabase 대시보드의 신뢰된 관리 기능에서만 사용하고, 웹사이트에 노출하지 마세요.

## 3) 관리자 패널 사용

- 데스크톱: 화면 오른쪽 설정 패널
- 모바일: 우측 하단 ⚙ 버튼
- 메시지 자동 답장 규칙: 한 줄에 `키워드|답장`
- 키워드를 비운 규칙은 기본 답장으로 사용
- 사진, 앨범 커버, 음악 파일은 브라우저가 접근 가능한 HTTPS URL을 사용
- 저장 후 Supabase 로그인이 되어 있으면 공개 설정으로 저장되고, 로그인이 없으면 현재 브라우저에만 저장됩니다.

## 중요 한계

- 전화는 시뮬레이션이며 실제 전화망/FaceTime을 실행하지 않습니다.
- Safari 검색 기록은 스토리용 가상 기록입니다. 방문자의 실제 검색 기록을 읽지 않습니다.
- 브라우저 웹 앱은 iOS 시스템 앱이나 설정을 직접 제어할 수 없습니다.
- 음악 자동 재생은 브라우저 정책상 사용자의 재생 버튼 입력이 필요할 수 있습니다.
- 관리자 계정에 강한 비밀번호를 쓰고, 공개 설정에 민감한 개인정보를 넣지 마세요.
- 이 프로젝트는 비공식 팬메이드 인터페이스이며 Apple 제품과 제휴하지 않습니다.
