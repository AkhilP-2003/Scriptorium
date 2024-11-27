import { useRouter } from "next/router";



const logout = () => {
  const router = useRouter();

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  router.push("/") // Redirect to the homepage
  return;
};

export default logout;