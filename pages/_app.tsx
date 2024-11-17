import NavigationBar from "@/components/NavigationBar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  // this part is for setting the global navigation so it doens't re render everytim we load a diff page
  const router = useRouter();
  const currPath = router.pathname;

  const isAuthPage = currPath === '/login' || currPath === '/signup';
  const links = isAuthPage
    ? [ // Links for login or sign-up pages
        { label: 'Home', href: '/' },
        { label: 'Editor', href: '/editor' },
        { label: 'Blogs', href: '/blogs' },
        { label: 'Templates', href: '/templates' },
        { label: currPath === '/login' ? 'Sign Up' : 'Login', href: currPath === '/login' ? '/signup' : '/login' },
      ]
    : [ // Links for all other pages
        { label: 'Home', href: '/' },
        { label: 'Editor', href: '/editor' },
        { label: 'Blogs', href: '/blogs' },
        { label: 'Templates', href: '/templates' },
        { label: 'Profile', href: '/profile' },
        { label: 'Logout', href: '/logout' },
      ];
      
  return (
    <>
    <div className="absolute top-0 left-0 right-0 z-10">
      <NavigationBar
        title="scriptorium"
        links={links}
        className="!shadow-lg"
      />
      </div>
      <Component {...pageProps} />
    </>
  );
}
