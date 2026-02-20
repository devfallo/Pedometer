# 캐릭터 만보기 러너 (PWA)

걸음 수 목표를 설정하고, 캐릭터를 골라 랜덤 맵 위에서 결승선까지 달리는 만보기 웹앱입니다.

## 기능
- 목표 걸음 수 설정
- 캐릭터 선택 (러너/고양이/로봇/유니콘)
- 랜덤 맵 생성
- 걸음 수에 따른 캐릭터 이동 애니메이션
- `beforeinstallprompt` 기반 홈 화면 설치 버튼
- Service Worker + Manifest 기반 PWA 오프라인 실행
- iOS/모바일 센서 권한 요청 + 데스크톱 테스트용 `+10 걸음` 버튼

## 로컬 실행
```bash
python3 -m http.server 4173
# 브라우저에서 http://localhost:4173 접속
```

## GitHub Pages 배포
이 저장소에는 `.github/workflows/deploy-pages.yml` 워크플로가 포함되어 있어 `main` 브랜치 푸시 시 자동 배포됩니다.

1. GitHub 저장소 `Settings > Pages`에서 **Source를 GitHub Actions**로 설정
2. `main` 브랜치에 푸시
3. Actions 탭에서 `Deploy static PWA to GitHub Pages` 성공 확인
4. 배포 URL 접속 후 홈 화면에 추가해 앱처럼 사용

> 참고: 실제 걸음 감지는 브라우저/기기/권한에 따라 다르게 동작할 수 있습니다.
