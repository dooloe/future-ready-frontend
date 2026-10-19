<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- All backend access goes through `api` in `src/lib/api/client.ts`; UI never calls fetch directly. Why: the mock (`src/lib/api/mock`) and the future real backend share one interface, switched by `VITE_API_BASE_URL`.
- API contracts live in `src/lib/api/types.ts`. Why: they are the agreed schema the backend must implement.
- UI strings live in `src/lib/i18n.tsx` (kk/ru). Why: both languages are required for every screen.
