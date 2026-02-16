import { Suspense } from "react";
import SignInPage from "./sign-in";

const Login = () => {
  return (
    <Suspense>
      <SignInPage />
    </Suspense>
  );
};

export default Login;
