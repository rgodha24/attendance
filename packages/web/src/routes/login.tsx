import { API } from "@/Root";
import { Button } from "@/components/ui/button";

export const Login = () => (
  <>
    <Button asChild>
      <a href={`${API}/auth/google/authorize`}>sign in w google</a>
    </Button>
  </>
);
