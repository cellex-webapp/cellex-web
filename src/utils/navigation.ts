import { useNavigate } from "react-router-dom";

export function useNav() {
  const navigate = useNavigate();
  return {
    go: (path: string) => navigate(path),
    back: () => navigate(-1),
    replace: (path: string) => navigate(path, { replace: true }),
  };
}
