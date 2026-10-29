# cc_statusline

[ccstatusline](https://github.com/sirmalloc/ccstatusline) 기반의 Claude Code 3줄 statusline 설정입니다.

```
모델 | git 브랜치(*=변경 있음) | 컨텍스트 % | 5h 사용량 (리셋까지) | 7d 사용량 (리셋까지)
▸ HH:MM 마지막으로 입력한 프롬프트
 └ 현재 작업 디렉터리
```

## 설치

필요한 것: Node.js(npm 포함), git

```sh
git clone https://github.com/1ev4v/cc_statusline.git
node cc_statusline/install.js
```

Claude Code를 재시작하면 적용됩니다. Windows, macOS, Linux 모두 같은 명령입니다.

설치 스크립트가 하는 일:

- `ccstatusline`이 없으면 `npm install -g ccstatusline`
- `statusline.js` → `~/.claude/statusline.js` (2번째 줄, 마지막 프롬프트 표시)
- `ccstatusline.json` → `~/.config/ccstatusline/settings.json` (프롬프트 스크립트 경로를 해당 PC 기준 절대경로로 바꿔서 저장)
- `~/.claude/settings.json`에 `statusLine` 항목만 추가/교체 (다른 설정은 그대로 유지)

덮어쓰는 파일은 같은 위치에 `.bak`으로 백업됩니다.

macOS/Linux에서 `npm install -g`가 권한 오류로 실패하면 `sudo npm install -g ccstatusline`을 먼저 실행한 뒤 `install.js`를 다시 실행하세요.

5h/7d 사용량은 Claude 구독 계정으로 로그인되어 있어야 표시됩니다.

## 레이아웃 수정

`ccstatusline`을 터미널에서 실행하면 편집 화면이 열립니다. 바꾼 설정을 이 레포에 반영하려면 `~/.config/ccstatusline/settings.json`을 `ccstatusline.json`으로 복사해서 커밋하면 됩니다. `commandPath`는 설치 시 자동으로 바뀌므로 그대로 둬도 됩니다.
