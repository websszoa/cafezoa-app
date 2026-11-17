# cafezoa-app

앱인토스(Apps in Toss) 기반 웹 앱입니다. React + Vite + TypeScript + Tailwind CSS + shadcn/ui로 구성되어 있습니다.

## 시작하기

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 실행
npm run build    # 타입 체크 + 빌드 + ait 빌드
npm run deploy   # 앱인토스 배포
```

## 셋팅 과정

```bash
# 1. 프로젝트 생성
npx create-ait-app .

# 2. Tailwind CSS 설치
npm install tailwindcss @tailwindcss/vite

# 3. shadcn/ui 초기화 (Radix 기반, Nova 프리셋)
npx shadcn@latest init -b radix -t vite -p nova

# 4. 컴포넌트 추가 (필요할 때마다)
npx shadcn@latest add button
```

2번과 3번 사이에 아래 파일을 수정했습니다.

- `vite.config.ts`: `tailwindcss()` 플러그인을 추가하고 `@` → `./src` alias를 설정
- `tsconfig.json`, `tsconfig.app.json`: `paths`에 `"@/*": ["./src/*"]`를 추가 (TS 6에서는 `baseUrl`을 쓰지 않음)
- `src/index.css`: 맨 위에 `@import "tailwindcss";`를 추가

## 설치된 패키지

### dependencies

| 패키지                        | 용도                                                                    |
| ----------------------------- | ----------------------------------------------------------------------- |
| `react`, `react-dom`          | UI 라이브러리                                                           |
| `@apps-in-toss/web-framework` | 앱인토스 웹 프레임워크                                                  |
| `tailwindcss`                 | 유틸리티 CSS 프레임워크 (v4)                                            |
| `@tailwindcss/vite`           | Tailwind Vite 플러그인                                                  |
| `shadcn`                      | shadcn CLI 및 기본 테마 CSS (`shadcn/tailwind.css`)                     |
| `radix-ui`                    | shadcn 컴포넌트의 기반 헤드리스 UI                                      |
| `class-variance-authority`    | 컴포넌트 variant(크기, 색상 등) 관리                                    |
| `cn`                          | Tailwind 클래스 병합 유틸 (`clsx` + `tailwind-merge` 대체, shadcn 공식) |
| `lucide-react`                | 아이콘                                                                  |
| `tw-animate-css`              | Tailwind 애니메이션 유틸                                                |

### devDependencies

| 패키지                                                                          | 용도                     |
| ------------------------------------------------------------------------------- | ------------------------ |
| `vite`, `@vitejs/plugin-react`                                                  | 번들러 및 React 플러그인 |
| `typescript`, `@types/*`                                                        | 타입스크립트             |
| `@apps-in-toss/devtools`                                                        | 앱인토스 개발 도구       |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-*`, `globals` | 린트                     |

## 폴더 구조

```
src/
├── components/ui/   # shadcn 컴포넌트 (npx shadcn add로 추가)
├── lib/utils.ts     # cn() 헬퍼
├── index.css        # Tailwind + shadcn 테마 변수
├── App.tsx
└── main.tsx
```
